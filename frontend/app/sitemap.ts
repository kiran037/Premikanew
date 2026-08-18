import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();
  let baseUrl = "https://premika.shop";

  try {
    const seoRes = await fetch(`${API_BASE_URL}/api/admin/settings/seo`, { cache: "no-store" });
    if (seoRes.ok) {
      const seoJson = await seoRes.json();
      if (seoJson.success && seoJson.data?.canonicalDomain) {
        baseUrl = seoJson.data.canonicalDomain.replace(/\/$/, "");
      }
    }
  } catch {
    // Fallback if SEO settings unavailable
  }

  // Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const [catRes, prodRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/products?limit=1000`, { cache: "no-store" }),
    ]);

    const catJson = catRes.ok ? await catRes.json() : null;
    const prodJson = prodRes.ok ? await prodRes.json() : null;

    const categories: any[] = catJson?.success && Array.isArray(catJson.data) ? catJson.data : [];
    const productItems: any[] = prodJson?.success && Array.isArray(prodJson.data) ? prodJson.data : [];

    // Filter active categories
    const categoryPages: MetadataRoute.Sitemap = categories
      .filter((cat) => cat.isActive && !cat.noIndex)
      .map((cat) => ({
        url: `${baseUrl}/category/${encodeURIComponent(cat.slug)}`,
        lastModified: cat.updatedAt ? new Date(cat.updatedAt).toISOString() : currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    // Filter active products
    const productPages: MetadataRoute.Sitemap = productItems
      .map((p: any) => ({
        url: `${baseUrl}/${encodeURIComponent(p.id)}`,
        lastModified: currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));

    // Deduplicate entries by URL
    const map = new Map<string, MetadataRoute.Sitemap[number]>();
    [...staticPages, ...categoryPages, ...productPages].forEach((entry) => {
      if (entry.url && !map.has(entry.url)) {
        map.set(entry.url, entry);
      }
    });

    return Array.from(map.values());
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticPages;
  }
}
