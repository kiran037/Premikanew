/**
 * Premika 2.0 Canonical Product Media & Image Aspect Ratio Tokens
 * Standardizes visual proportions for editorial lookbooks, product grids, hero banners, and thumbnails.
 */

export const MEDIA_ASPECT_RATIOS = {
  // Editorial Product Portrait (4:5 / Luxury Fashion Lookbook)
  productPortrait: 0.78,

  // 1:1 Square Catalog
  productSquare: 1.0,

  // Product Detail Screen Gallery Hero (Edge-to-Edge Fluid Viewport)
  heroPortrait: 1.1,

  // Full-width Hero Home Banner Carousel
  heroWide: 2.2,

  // Category Visual Cards
  categoryPortrait: 0.9,
  categorySquare: 1.0,
  categoryHorizontal: 1.1,

  // Multi-image Paging Gallery
  gallery: 1.1,

  // Compact Commerce Thumbnails (Cart items, order history, checkout rows)
  thumbnail: 0.8,
} as const;

export type MediaAspectRatio = keyof typeof MEDIA_ASPECT_RATIOS;
