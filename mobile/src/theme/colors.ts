/**
 * Premika 2.0 Semantic Color Architecture & Apple iOS Color Hierarchy
 *
 * Preserves the signature Premika brand identity (Royal Maroon / Terracotta / Warm Porcelain / Peach)
 * with refined semantic roles, soft neutral surfaces, and balanced Light and Dark palettes.
 *
 * Hierarchy:
 * - Brand Accents: Selected controls, primary CTAs, commerce highlights (Used strategically, not everywhere)
 * - Soft Neutral Surfaces: Backgrounds, cards, elevated modules (Dominates UI so fashion photography shines)
 * - System Chrome & Glass: Translucent navigation and floating action bars
 */

export const BRAND_PALETTE = {
  // Signature Premika Royal Maroon
  maroon: '#78201E',
  maroonLight: '#9A2E2C',
  maroonDark: '#501514',
  maroonSubtle: 'rgba(120, 32, 30, 0.08)',
  maroonMuted: 'rgba(120, 32, 30, 0.14)',

  // Warm Terracotta Secondary
  terracotta: '#92574A',
  terracottaDark: '#6A3E34',
  terracottaLight: '#B5786B',
  terracottaSubtle: 'rgba(146, 87, 74, 0.10)',

  // Rich Espresso Charcoal
  espresso: '#351B1A',
  espressoDark: '#201010',
  espressoLight: '#4A2A28',

  // Warm Peach & Soft Cream Accents
  peach: '#FDE3CE',
  peachLight: '#FFF8F3',
  peachDark: '#E4BFA6',
  cream: '#FBF9F7',
  gold: '#D4AF37',

  // Status & Commerce Feedback
  success: '#16A34A',
  successLight: '#DCFCE7',
  successDark: '#15803D',

  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningDark: '#B45309',

  error: '#DC2626',
  errorLight: '#FEE2E2',
  errorDark: '#B91C1C',

  info: '#2563EB',
  infoLight: '#DBEAFE',
  infoDark: '#1D4ED8',

  // Fashion Commerce Specials
  sale: '#C22824',
  saleLight: '#FEE8E7',
  newArrival: '#B5786B',
  newArrivalLight: '#FBF2EF',
  featured: '#78201E',
  featuredLight: '#F8ECEC',
} as const;

// Backward-compatible alias for existing imports
export const BRAND_COLORS = {
  ...BRAND_PALETTE,
  primary: BRAND_PALETTE.maroon,
  secondary: BRAND_PALETTE.espresso,
} as const;

export const LIGHT_THEME = {
  mode: 'light' as const,

  // 1. Backgrounds (Soft warm porcelain / ecru hierarchy)
  background: '#F8F6F4',
  backgroundSecondary: '#F2EDE9',
  backgroundTertiary: '#EAE2DC',

  // 2. Surfaces & Containers (Dominant neutral canvas for photography)
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F6F4',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F4EFEA',
  surfaceSubtle: '#FAF7F5',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.88)',

  // 3. Typography & Labels
  textPrimary: '#1C1515',
  textSecondary: '#635352',
  textTertiary: '#8E7D7B',
  textMuted: '#948382',
  textQuaternary: '#B8A8A6',
  textInverse: '#FFFFFF',

  // 4. Interactive Brand Strategy
  brandPrimary: BRAND_PALETTE.maroon,
  brandSecondary: BRAND_PALETTE.terracotta,
  brandMuted: BRAND_PALETTE.maroonMuted,
  brandAccent: BRAND_PALETTE.peach,
  brandTerracotta: BRAND_PALETTE.terracotta,
  brandPeach: BRAND_PALETTE.peach,

  primary: BRAND_PALETTE.maroon,
  primaryForeground: '#FFFFFF',
  secondary: BRAND_PALETTE.terracotta,
  secondaryForeground: '#FFFFFF',
  accent: BRAND_PALETTE.peach,
  accentSoft: BRAND_PALETTE.peachLight,
  accentForeground: BRAND_PALETTE.espresso,
  tint: BRAND_PALETTE.maroon,

  // 5. Fills & Interactive States
  fillPrimary: 'rgba(120, 32, 30, 0.08)',
  fillSecondary: 'rgba(0, 0, 0, 0.04)',
  fillTertiary: 'rgba(0, 0, 0, 0.02)',
  fillQuaternary: 'rgba(0, 0, 0, 0.01)',

  // 6. Separators & Borders (Quiet, restrained hairline borders)
  border: '#E8DDD6',
  borderStrong: '#D6C5BC',
  borderSubtle: '#F1E8E2',
  borderFocus: BRAND_PALETTE.maroon,
  divider: '#F1E8E2',
  separator: '#E8DDD6',
  separatorOpaque: '#E0D4CC',

  // 7. Status & Commerce Signals
  success: BRAND_PALETTE.success,
  successLight: BRAND_PALETTE.successLight,
  warning: BRAND_PALETTE.warning,
  warningLight: BRAND_PALETTE.warningLight,
  error: BRAND_PALETTE.error,
  errorLight: BRAND_PALETTE.errorLight,
  info: BRAND_PALETTE.info,
  infoLight: BRAND_PALETTE.infoLight,

  sale: BRAND_PALETTE.sale,
  saleLight: BRAND_PALETTE.saleLight,
  discount: BRAND_PALETTE.sale,
  discountLight: BRAND_PALETTE.saleLight,
  newArrival: BRAND_PALETTE.newArrival,
  newArrivalLight: BRAND_PALETTE.newArrivalLight,
  featured: BRAND_PALETTE.featured,
  featuredLight: BRAND_PALETTE.featuredLight,

  // 8. Apple Liquid Glass & Material Tokens
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.82)',
  glassHighlight: 'rgba(255, 255, 255, 0.95)',
  glassOverlay: 'rgba(20, 10, 10, 0.40)',
  glassTint: 'rgba(255, 255, 255, 0.65)',

  statusBar: 'dark-content' as const,
} as const;

export const DARK_THEME = {
  mode: 'dark' as const,

  // 1. Backgrounds (Deep rich cocoa / espresso dark hierarchy)
  background: '#120C0C',
  backgroundSecondary: '#1A1212',
  backgroundTertiary: '#241A1A',

  // 2. Surfaces & Containers
  surface: '#1E1616',
  surfaceSecondary: '#261D1D',
  surfaceElevated: '#2E2323',
  surfaceMuted: '#241A1A',
  surfaceSubtle: '#1A1313',
  surfaceTranslucent: 'rgba(30, 22, 22, 0.88)',

  // 3. Typography & Labels
  textPrimary: '#FAF5F3',
  textSecondary: '#C5B5B3',
  textTertiary: '#A69593',
  textMuted: '#8E7D7B',
  textQuaternary: '#635352',
  textInverse: '#120C0C',

  // 4. Interactive Brand Strategy
  brandPrimary: '#E06B68',
  brandSecondary: BRAND_PALETTE.terracottaLight,
  brandMuted: 'rgba(224, 107, 104, 0.18)',
  brandAccent: '#3D2523',
  brandTerracotta: BRAND_PALETTE.terracottaLight,
  brandPeach: BRAND_PALETTE.peach,

  primary: '#E06B68',
  primaryForeground: '#120C0C',
  secondary: BRAND_PALETTE.terracottaLight,
  secondaryForeground: '#120C0C',
  accent: '#3D2523',
  accentSoft: '#2E1C1A',
  accentForeground: BRAND_PALETTE.peach,
  tint: '#E06B68',

  // 5. Fills & Interactive States
  fillPrimary: 'rgba(224, 107, 104, 0.15)',
  fillSecondary: 'rgba(255, 255, 255, 0.08)',
  fillTertiary: 'rgba(255, 255, 255, 0.04)',
  fillQuaternary: 'rgba(255, 255, 255, 0.02)',

  // 6. Separators & Borders
  border: '#3D2C2A',
  borderStrong: '#523C3A',
  borderSubtle: '#2A1E1D',
  borderFocus: '#E06B68',
  divider: '#2A1E1D',
  separator: '#3D2C2A',
  separatorOpaque: '#453330',

  // 7. Status & Commerce Signals
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.20)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.20)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.20)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.20)',

  sale: '#F87171',
  saleLight: 'rgba(248, 113, 113, 0.18)',
  discount: '#F87171',
  discountLight: 'rgba(248, 113, 113, 0.18)',
  newArrival: '#D49B8E',
  newArrivalLight: 'rgba(212, 155, 142, 0.18)',
  featured: '#E06B68',
  featuredLight: 'rgba(224, 107, 104, 0.18)',

  // 8. Apple Liquid Glass & Material Tokens
  glassBg: 'rgba(30, 22, 22, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  glassHighlight: 'rgba(255, 255, 255, 0.20)',
  glassOverlay: 'rgba(0, 0, 0, 0.65)',
  glassTint: 'rgba(30, 22, 22, 0.70)',

  statusBar: 'light-content' as const,
} as const;

export type ThemeColors = typeof LIGHT_THEME;
export type ColorRole = keyof ThemeColors;
