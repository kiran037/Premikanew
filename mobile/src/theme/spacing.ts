/**
 * Premika 2.0 Standard Spacing Scale (4pt / 8pt Base Grid System)
 * Centralizes layout padding, margins, gutters, rail padding & component spacing.
 */

export const SPACING = {
  // Numeric Grid Scale
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  massive: 64,

  // Semantic Layout Tokens
  page: 16,
  pageGutter: 16,
  card: 16,
  cardInner: 12,
  cardGutter: 12,
  section: 24,
  sectionHeader: 12,
  sectionGap: 24,
  rowGap: 12,
  itemGap: 8,
  railItemGap: 12,
  railPadding: 16,
  gridGutter: 12,
  headerHeight: 44,
  tabBarHeight: 50,
  bottomBarHeight: 76,
  touchTargetMin: 44,
} as const;

export type Spacing = keyof typeof SPACING;
