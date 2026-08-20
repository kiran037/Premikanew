import { db } from "@/db/client";
import { wishlists, wishlistItems } from "@/db/schema/customer";
import { products, productImages } from "@/db/schema/product";
import { eq, and, or, desc } from "drizzle-orm";
import { getDiscountedPrice } from "@/utils/pricing";

export class CustomerWishlistService {
  /**
   * Helper to ensure customer has a wishlist record
   */
  private static async getOrCreateWishlist(customerId: string) {
    let wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.customerId, customerId))
      .then((rows) => rows[0] || null);

    if (!wishlist) {
      const [created] = await db
        .insert(wishlists)
        .values({ customerId })
        .returning();
      wishlist = created;
    }

    return wishlist;
  }

  /**
   * Get full wishlist for authenticated customer with product details
   */
  static async getWishlist(customerId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId);

    const items = await db
      .select({
        wishlistItemId: wishlistItems.id,
        addedAt: wishlistItems.createdAt,
        product: products,
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.wishlistId, wishlist.id))
      .orderBy(desc(wishlistItems.createdAt));

    if (items.length === 0) {
      return { wishlistId: wishlist.id, items: [] };
    }

    const productIds = items.map((i) => i.product.id);

    // Fetch primary images
    const imagesMap = new Map<string, string>();
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.isPrimary, true));

    images.forEach((img) => {
      imagesMap.set(img.productId, img.image);
    });

    const enrichedItems = items.map((item) => {
      const p = item.product;
      const pricing = getDiscountedPrice({ price: p.price });
      const primaryImage = imagesMap.get(p.id) || "/placeholder.svg";
      const calcDiscountPct = p.compareAtPrice && p.compareAtPrice > p.price
        ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
        : 0;

      return {
        id: item.wishlistItemId,
        productId: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        discountedPrice: Math.floor(pricing.discountedPrice),
        discountPercentage: calcDiscountPct,
        image: primaryImage,
        stockStatus: p.stockStatus,
        inStock: p.stockStatus === "in_stock" || p.stockStatus === "low_stock",
        addedAt: item.addedAt,
      };
    });

    return {
      wishlistId: wishlist.id,
      items: enrichedItems,
    };
  }

  /**
   * Add item to wishlist (prevents duplicate items)
   */
  static async addItem(customerId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId);

    // Verify product exists
    const prod = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .then((r) => r[0] || null);

    if (!prod) {
      throw new Error("Product not found");
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist.id),
          eq(wishlistItems.productId, productId)
        )
      )
      .then((r) => r[0] || null);

    if (existing) {
      return { success: true, item: existing, message: "Item already in wishlist" };
    }

    const [newItem] = await db
      .insert(wishlistItems)
      .values({
        wishlistId: wishlist.id,
        productId,
      })
      .returning();

    return { success: true, item: newItem, message: "Added to wishlist" };
  }

  /**
   * Remove item from wishlist by productId or wishlistItemId
   */
  static async removeItem(customerId: string, productIdOrWishlistItemId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId);

    // Delete by productId OR wishlistItemId, scoped strictly to customer's wishlistId
    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist.id),
          or(
            eq(wishlistItems.productId, productIdOrWishlistItemId),
            eq(wishlistItems.id, productIdOrWishlistItemId)
          )
        )
      );

    return true;
  }

  /**
   * Toggle item in customer's wishlist
   */
  static async toggleItem(customerId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId);

    const existing = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist.id),
          eq(wishlistItems.productId, productId)
        )
      )
      .then((r) => r[0] || null);

    if (existing) {
      await this.removeItem(customerId, productId);
      return { inWishlist: false, message: "Removed from wishlist" };
    } else {
      await this.addItem(customerId, productId);
      return { inWishlist: true, message: "Added to wishlist" };
    }
  }
}
