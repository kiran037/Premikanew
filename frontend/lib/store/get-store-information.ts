import { cache } from "react";
import { unstable_cache } from "next/cache";

export interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  icon?: string | null;
  isActive: boolean;
  sortOrder: string;
}

export interface StoreInformation {
  storeName: string;
  storeEmail: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  googleMapsUrl: string | null;
  formattedAddress: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  socialLinks: SocialLinkItem[];
  logo?: string | null;
}

const DEFAULT_STORE_INFO: StoreInformation = {
  storeName: "Premika Store",
  storeEmail: "premika.shop@gmail.com",
  supportEmail: "premika.shop@gmail.com",
  supportPhone: "+919599215195",
  businessHours: "9 AM - 6 PM IST (Mon-Fri)",
  address: null,
  city: null,
  state: null,
  country: "India",
  postalCode: null,
  googleMapsUrl: null,
  formattedAddress: "Online Store Based in India",
  facebookUrl: "https://www.facebook.com/",
  instagramUrl: "https://www.instagram.com/premika.store",
  twitterUrl: "https://twitter.com/",
  socialLinks: [],
  logo: null,
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

const fetchStoreInformation = async (): Promise<StoreInformation> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/settings/store`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEFAULT_STORE_INFO;
    const json = await res.json();
    if (json.success && json.data) {
      return {
        ...DEFAULT_STORE_INFO,
        ...json.data,
      };
    }
    return DEFAULT_STORE_INFO;
  } catch {
    return DEFAULT_STORE_INFO;
  }
};

export const getStoreInformation = cache(
  unstable_cache(
    fetchStoreInformation,
    ["get-store-information-fn"],
    { revalidate: 300, tags: ["store-info", "store-settings", "store-contacts", "social-links"] }
  )
);

export default getStoreInformation;
