import { db } from "@/db/client";
import { carts, cartItems } from "@/db/schema/customer";
import {
  products,
  productImages,
  productSizes,
  productHeights,
} from "@/db/schema/product";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getDiscountedPrice } from "@/utils/pricing";
import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productSizeId: z.string().optional().nullable(),
  productHeightId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
});

export const mergeCartSchema = z.object({
  items: z.array(addCartItemSchema),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export class CustomerCartService {
  /**
   * Helper to find or create server-side cart for customer
   */
  private static async getOrCreateCart(customerId: string) {
    let cart = await db
      .select()
      .from(carts)
      .where(eq(carts.customerId, customerId))
      .then((rows) => rows[0] || null);

    if (!cart) {
      const [created] = await db
        .insert(carts)
        .values({ customerId })
        .returning();
      cart = created;
    }

    return cart;
  }

  /**
   * Get full cart for authenticated customer
   */
  static async getCart(customerId: string) {
    const cart = await this.getOrCreateCart(customerId);

    const items = await db
      .select({
        cartItemId: cartItems.id,
        quantity: cartItems.quantity,
        unitPrice: cartItems.unitPrice,
        productSizeId: cartItems.productSizeId,
        productHeightId: cartItems.productHeightId,
        createdAt: cartItems.createdAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id))
      .orderBy(desc(cartItems.createdAt));

    if (items.length === 0) {
      return {
        cartId: cart.id,
        items: [],
        subtotal: 0,
        totalQuantity: 0,
      };
    }

    // Fetch primary images, sizes, and heights for enrichment
    const productIds = Array.from(new Set(items.map((i) => i.product.id)));

    const [images, sizes, heights] = await Promise.all([
      db
        .select()
        .from(productImages)
        .where(
          and(
            inArray(productImages.productId, productIds),
            eq(productImages.isPrimary, true)
          )
        ),
      db
        .select()
        .from(productSizes)
        .where(inArray(productSizes.productId, productIds)),
      db
        .select()
        .from(productHeights)
        .where(inArray(productHeights.productId, productIds)),
    ]);

    const imagesMap = new Map<string, string>();
    images.forEach((img) => imagesMap.set(img.productId, img.image));

    const sizesMap = new Map<string, any>();
    sizes.forEach((s) => sizesMap.set(s.id, s));

    const heightsMap = new Map<string, any>();
    heights.forEach((h) => heightsMap.set(h.id, h));

    let subtotal = 0;
    let totalQuantity = 0;

    const enrichedItems = items.map((item) => {
      const p = item.product;
      const primaryImage = imagesMap.get(p.id) || "/placeholder.svg";
      const sizeObj = item.productSizeId ? sizesMap.get(item.productSizeId) : null;
      const heightObj = item.productHeightId ? heightsMap.get(item.productHeightId) : null;

      // Validate server-side price
      const pricing = getDiscountedPrice({ price: p.price });
      const currentUnitPrice = Math.floor(pricing.discountedPrice);
      const itemSubtotal = currentUnitPrice * item.quantity;

      subtotal += itemSubtotal;
      totalQuantity += item.quantity;

      return {
        id: item.cartItemId,
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: primaryImage,
        quantity: item.quantity,
        unitPrice: currentUnitPrice,
        totalPrice: itemSubtotal,
        selectedSize: sizeObj ? sizeObj.size : null,
        selectedSizeId: sizeObj ? sizeObj.id : null,
        selectedHeight: heightObj ? heightObj.label : null,
        selectedHeightId: heightObj ? heightObj.id : null,
        stockStatus: p.stockStatus,
        inStock: p.stockStatus === "in_stock" || p.stockStatus === "low_stock",
      };
    });

    return {
      cartId: cart.id,
      items: enrichedItems,
      subtotal,
      totalQuantity,
    };
  }

  /**
   * Add item to customer cart
   */
  static async addItem(customerId: string, input: AddCartItemInput) {
    const cart = await this.getOrCreateCart(customerId);

    // 1. Validate Product
    const prod = await db
      .select()
      .from(products)
      .where(eq(products.id, input.productId))
      .then((r) => r[0] || null);

    if (!prod) {
      throw new Error("Product not found");
    }

    if (prod.stockStatus === "out_of_stock") {
      throw new Error(`Product "${prod.name}" is currently out of stock`);
    }

    // 2. Calculate Server-Side Unit Price
    const pricing = getDiscountedPrice({ price: prod.price });
    const unitPrice = Math.floor(pricing.discountedPrice);
    const qtyToAdd = Math.max(1, input.quantity);

    // 3. Validate size if provided
    let sizeId: string | null = input.productSizeId || null;
    if (sizeId) {
      const validSize = await db
        .select()
        .from(productSizes)
        .where(
          and(
            eq(productSizes.id, sizeId),
            eq(productSizes.productId, prod.id)
          )
        )
        .then((r) => r[0] || null);

      if (!validSize) {
        throw new Error("Invalid size selection for product");
      }
      if (!validSize.isAvailable || validSize.stock <= 0) {
        throw new Error(`Selected size "${validSize.size}" is out of stock`);
      }
    }

    // 4. Validate height if provided
    let heightId: string | null = input.productHeightId || null;
    if (heightId) {
      const validHeight = await db
        .select()
        .from(productHeights)
        .where(
          and(
            eq(productHeights.id, heightId),
            eq(productHeights.productId, prod.id)
          )
        )
        .then((r) => r[0] || null);

      if (!validHeight) {
        throw new Error("Invalid height selection for product");
      }
    }

    // 5. Check if matching variant exists in cart
    const existingItems = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, prod.id)
        )
      );

    const matchingItem = existingItems.find((ci) => {
      const sameSize = (ci.productSizeId || null) === sizeId;
      const sameHeight = (ci.productHeightId || null) === heightId;
      return sameSize && sameHeight;
    });

    if (matchingItem) {
      const newQty = matchingItem.quantity + qtyToAdd;
      await db
        .update(cartItems)
        .set({
          quantity: newQty,
          unitPrice,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, matchingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: prod.id,
        productSizeId: sizeId,
        productHeightId: heightId,
        quantity: qtyToAdd,
        unitPrice,
      });
    }

    return await this.getCart(customerId);
  }

  /**
   * Update quantity of a cart item scoped to customer cart
   */
  static async updateItemQuantity(
    customerId: string,
    cartItemId: string,
    newQuantity: number
  ) {
    const cart = await this.getOrCreateCart(customerId);

    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, cartItemId),
          eq(cartItems.cartId, cart.id)
        )
      )
      .then((r) => r[0] || null);

    if (!existing) {
      throw new Error("Cart item not found or unauthorized");
    }

    if (newQuantity <= 0) {
      await db
        .delete(cartItems)
        .where(eq(cartItems.id, cartItemId));
    } else {
      await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, cartItemId));
    }

    return await this.getCart(customerId);
  }

  /**
   * Remove item from cart
   */
  static async removeItem(customerId: string, cartItemId: string) {
    const cart = await this.getOrCreateCart(customerId);

    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.id, cartItemId),
          eq(cartItems.cartId, cart.id)
        )
      );

    return await this.getCart(customerId);
  }

  /**
   * Clear all items in customer cart
   */
  static async clearCart(customerId: string) {
    const cart = await this.getOrCreateCart(customerId);

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return {
      cartId: cart.id,
      items: [],
      subtotal: 0,
      totalQuantity: 0,
    };
  }

  /**
   * Merge guest cart items into customer cart
   */
  static async mergeGuestCart(customerId: string, guestItems: AddCartItemInput[]) {
    for (const item of guestItems) {
      try {
        await this.addItem(customerId, item);
      } catch (err) {
        // Skip invalid/out-of-stock items silently during bulk merge
      }
    }

    return await this.getCart(customerId);
  }
}
