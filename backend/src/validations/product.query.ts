import { z } from "zod";

export const getProductsQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Math.max(1, Number(val)) : 1)),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Math.min(100, Math.max(1, Number(val))) : 20)),
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return "featured" as const;
      const normalized = val.toLowerCase().trim();
      if (normalized === "price_asc" || normalized === "price-asc" || normalized === "price-low") return "price-low" as const;
      if (normalized === "price_desc" || normalized === "price-desc" || normalized === "price-high") return "price-high" as const;
      if (normalized === "title_asc" || normalized === "name_asc" || normalized === "name") return "name" as const;
      if (normalized === "newest") return "newest" as const;
      if (normalized === "featured") return "featured" as const;
      return "featured" as const;
    })
    .default("featured"),
  featured: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined)),
  newArrival: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined)),
  minPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined)),
  maxPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined)),
  inStock: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined)),
});

export const productSlugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type GetProductsInput = z.input<typeof getProductsQuerySchema>;
