/**
 * Premika 2.0 Border Radius Scale & iOS Continuous Corner Curves
 * Standardizes rounded corners across product images, cards, sheets, chips, buttons & modals.
 */

export const RADIUS = {
  // Numeric Tokens
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  pill: 9999,
  full: 9999,

  // Semantic Component Radii
  productImage: 16,
  card: 16,
  cardLarge: 20,
  cardCompact: 12,
  sheet: 24,
  modal: 20,
  floating: 24,
  control: 12,
  button: 12,
  buttonSmall: 8,
  buttonPill: 9999,
  input: 12,
  chip: 9999,
  badge: 6,
  avatar: 9999,
  dot: 9999,
} as const;

export type Radius = keyof typeof RADIUS;
