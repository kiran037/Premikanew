import React from "react";
import JsonLd from "@/components/JsonLd";
import { Tag } from "lucide-react";
import { Metadata } from "next";
import CategoryClientContent from "./category-client-content";

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    availability?: string;
    featured?: string;
    new?: string;
    sort?: string;
  };
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

async function getCategoryData(slug: string) {
  try {
    const [catRes, allCatsRes, prodRes, seoRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE_URL}/api/categories`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE_URL}/api/products?category=${encodeURIComponent(slug)}&limit=100`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE_URL}/api/admin/settings/seo`, { next: { revalidate: 300 } }),
    ]);

    const catJson = catRes.ok ? await catRes.json() : null;
    const allCatsJson = allCatsRes.ok ? await allCatsRes.json() : null;
    const prodJson = prodRes.ok ? await prodRes.json() : null;
    const seoJson = seoRes.ok ? await seoRes.json() : null;

    return {
      categoryRecord: catJson?.success ? catJson.data : null,
      categories: allCatsJson?.success && Array.isArray(allCatsJson.data) ? allCatsJson.data : [],
      allProducts: prodJson?.success && Array.isArray(prodJson.data) ? prodJson.data : [],
      seo: seoJson?.success ? seoJson.data : null,
    };
  } catch {
    return {
      categoryRecord: null,
      categories: [],
      allProducts: [],
      seo: null,
    };
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug).toLowerCase();
  const { categoryRecord, seo } = await getCategoryData(decodedSlug);

  const displayCategoryName =
    categoryRecord?.name ||
    decodedSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const canonicalDomain = seo?.canonicalDomain || "https://premika.shop";
  const defaultTitle = `${displayCategoryName} | ${seo?.siteName || "Premika"}`;
  const defaultDescription =
    categoryRecord?.description ||
    `Discover our handcrafted ${displayCategoryName.toLowerCase()} collection designed for timeless grace.`;

  const metaTitle = categoryRecord?.metaTitle || defaultTitle;
  const metaDescription = categoryRecord?.metaDescription || defaultDescription;
  const keywords = categoryRecord?.keywords
    ? categoryRecord.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : seo?.defaultKeywords
    ? seo.defaultKeywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    : undefined;

  const canonicalUrl =
    categoryRecord?.canonicalUrl || `${canonicalDomain}/category/${categoryRecord?.slug || decodedSlug}`;
  const ogImage =
    categoryRecord?.ogImage || categoryRecord?.image || seo?.defaultOgImage || "/logo.png";
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
          alt: displayCategoryName,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
      creator: twitterHandle,
    },
    robots: {
      index: !categoryRecord?.noIndex,
      follow: !categoryRecord?.noIndex,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const decodedSlug = decodeURIComponent(params.slug).toLowerCase();
  const { categoryRecord, categories, allProducts, seo } = await getCategoryData(decodedSlug);

  const displayCategoryName =
    categoryRecord?.name ||
    decodedSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const canonicalDomain = seo?.canonicalDomain || "https://premika.shop";

  const breadcrumbs = [
    { name: "Home", url: canonicalDomain },
    { name: "Shop", url: `${canonicalDomain}/shop` },
    { name: displayCategoryName, url: `${canonicalDomain}/category/${decodedSlug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd type="BreadcrumbList" items={breadcrumbs} />

      {/* Category Header Banner */}
      <div className="bg-popover/30 border-b border-[#B67B5C]/30 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-primary/20 text-xs font-bold text-primary mb-3 uppercase tracking-wider">
            <Tag size={13} />
            <span>Category Edit</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {displayCategoryName}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            {categoryRecord?.description ||
              `Discover our handcrafted ${displayCategoryName.toLowerCase()} collection designed for timeless grace.`}
          </p>
        </div>
      </div>

      <CategoryClientContent
        displayCategoryName={displayCategoryName}
        categories={categories}
        allProducts={allProducts}
        initialSearchParams={searchParams}
      />
    </div>
  );
}
