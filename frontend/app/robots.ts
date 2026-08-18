import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

export default async function robots(): Promise<MetadataRoute.Robots> {
  let baseUrl = "https://premika.shop";
  let defaultRobots = "index, follow";

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/settings/seo`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.canonicalDomain) baseUrl = json.data.canonicalDomain;
        if (json.data.defaultRobots) defaultRobots = json.data.defaultRobots;
      }
    }
  } catch (error) {
    console.error("Error generating robots.txt from Node backend:", error);
  }

  const isNoIndex = defaultRobots.includes("noindex");

  if (isNoIndex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${baseUrl}/sitemap.xml`,
      host: baseUrl,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/checkout/", "/cart/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
