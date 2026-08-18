import { cache } from "react";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { ProductInfo } from "@/components/product-info";
import { ProductTabs } from "@/components/product-tabs";
import { RelatedProducts } from "@/components/related-products";
import { Breadcrumb } from "@/components/breadcrumb";
import JsonLd from "@/components/JsonLd";
import { getDiscountedPrice } from "@/lib/pricing";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { unstable_cache } from "next/cache";

interface SingleProductPageProps {
  params: {
    productId: string;
  };
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

const getCachedProductBySlug = cache((productId: string) =>
  unstable_cache(
    async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, { next: { revalidate: 300 } });
        if (!res.ok) return null;
        const json = await res.json();
        return json.success ? json.data : null;
      } catch {
        return null;
      }
    },
    [`product-detail-${productId}`],
    { revalidate: 300, tags: ["products", `product-${productId}`] }
  )()
);

const getCachedSeoSettings = cache(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/settings/seo`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: SingleProductPageProps): Promise<Metadata> {
  const [productItem, seo] = await Promise.all([
    getCachedProductBySlug(params.productId),
    getCachedSeoSettings(),
  ]);

  if (!productItem) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const productFormatted = productItem.product ? {
    ...productItem.product,
    images: productItem.images?.map((i: any) => i.url) || [],
    sizes: productItem.sizes || [],
    heights: productItem.heights || [],
    reviews: productItem.reviews || [],
    inStock: (productItem.sizes || []).some((s: any) => s.inStock),
  } : productItem;

  const p = productItem.product || productItem;

  const pricing = getDiscountedPrice(productFormatted);
  const priceDisplay = pricing.isOnSale
    ? `₹${pricing.discountedPrice.toFixed(2)} (${pricing.discount}% OFF - was ₹${pricing.originalPrice.toFixed(2)})`
    : `₹${(productFormatted.price || 0).toFixed(2)}`;

  const canonicalDomain = seo?.canonicalDomain || "https://premika.shop";
  const defaultTitle = `${p.name} | ${seo?.siteName || "Premika"}`;
  const defaultDescription = `${p.shortDescription || p.name} - Available at ${seo?.siteName || "Premika Store"} for ${priceDisplay}. ${productFormatted.inStock ? "In Stock" : "Out of Stock"}.`;

  const metaTitle = p.metaTitle || defaultTitle;
  const metaDescription = p.metaDescription || defaultDescription;
  const keywords = p.keywords
    ? p.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : seo?.defaultKeywords
    ? seo.defaultKeywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : undefined;

  const canonicalUrl = p.canonicalUrl || `${canonicalDomain}/${p.slug || p.id}`;
  const ogImage = p.ogImage || (productFormatted.images && productFormatted.images[0]) || seo?.defaultOgImage || "/logo.png";
  const twitterHandle = seo?.twitterHandle || "@premika_store";

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: seo?.siteName || "Premika Store",
      images: [
        {
          url: ogImage,
          alt: p.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
      creator: twitterHandle,
    },
    robots: {
      index: !p.noIndex,
      follow: !p.noIndex,
    },
  };
}

export default async function SingleProductPage({ params }: SingleProductPageProps) {
  const [productItem, seo] = await Promise.all([
    getCachedProductBySlug(params.productId),
    getCachedSeoSettings(),
  ]);

  if (!productItem) {
    notFound();
  }

  const product = productItem.product ? {
    ...productItem.product,
    images: productItem.images?.map((i: any) => i.url) || [],
    sizes: productItem.sizes || [],
    heights: productItem.heights || [],
    reviews: productItem.reviews || [],
    inStock: (productItem.sizes || []).some((s: any) => s.inStock),
  } : productItem;
  const pRecord = productItem.product || productItem;
  const canonicalDomain = seo?.canonicalDomain || "https://premika.shop";

  // Fetch related products in category
  let categoryProducts: any[] = [];
  try {
    const relRes = await fetch(`${API_BASE_URL}/api/products?category=${encodeURIComponent(product.category || "")}&limit=5`, { next: { revalidate: 300 } });
    if (relRes.ok) {
      const relJson = await relRes.json();
      if (relJson.success && Array.isArray(relJson.data)) {
        categoryProducts = relJson.data;
      }
    }
  } catch {
    categoryProducts = [];
  }

  const relatedProducts = categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map((p) => {
      const pricing = getDiscountedPrice(p);
      return {
        ...p,
        price: pricing.discountedPrice,
        originalPrice: pricing.originalPrice,
        isOnSale: pricing.isOnSale,
        discount: pricing.discount,
        rating: 5,
        images: p.images,
      };
    });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.name, href: `/${product.id}` },
  ];

  const jsonLdBreadcrumbs = [
    { name: "Home", url: canonicalDomain },
    { name: "Shop", url: `${canonicalDomain}/shop` },
    { name: product.name, url: `${canonicalDomain}/${product.id}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data JSON-LD */}
      <JsonLd
        type="Product"
        name={product.name}
        description={pRecord.metaDescription || product.shortDescription}
        image={product.images}
        price={product.price}
        availability={product.inStock}
        sku={pRecord.sku || product.id}
        brand={seo?.siteName || "Premika"}
        category={product.category}
        url={`${canonicalDomain}/${product.id}`}
        ratingValue={product.reviews.length > 0 ? 5 : undefined}
        reviewCount={product.reviews.length > 0 ? product.reviews.length : undefined}
      />
      <JsonLd type="BreadcrumbList" items={jsonLdBreadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
          {/* Product Images */}
          <ProductImageCarousel images={product.images} alt={product.name} />

          {/* Product Details */}
          <ProductInfo
            id={product.id}
            title={product.name}
            price={product.price}
            rating={5}
            reviewCount={product.reviews.length}
            description={product.shortDescription}
            categories={[product.category]}
            tags={[product.category]}
            sizes={product.sizes}
            heights={(product as any).heights}
            inStock={product.inStock}
            images={product.images}
            isCombo={product.isCombo}
            comboItems={product.comboItems}
            gender={(product as any).gender}
          />
        </div>

        {/* Product Description Tabs */}
        <div className="mb-16">
          <ProductTabs
            description={product.longDescription}
            reviews={product.reviews}
          />
        </div>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts as any} />
      </div>
    </div>
  );
}
