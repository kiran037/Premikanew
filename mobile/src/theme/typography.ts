/**
 * Premika 2.0 iOS Native Typography System
 * Built on Apple San Francisco (System) font specifications with Dynamic Type scaling compatibility.
 * Includes dedicated hierarchies for general UI, product commerce, and controls.
 */

import { TextStyle, Platform, PixelRatio } from 'react-native';

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const FONT_FAMILY = {
  regular: Platform.select({ ios: 'System', default: 'System' }),
  medium: Platform.select({ ios: 'System', default: 'System' }),
  semiBold: Platform.select({ ios: 'System', default: 'System' }),
  bold: Platform.select({ ios: 'System', default: 'System' }),
} as const;

/**
 * Standard Apple iOS Human Interface Guidelines Typography Hierarchy
 */
export const IOS_TYPOGRAPHY: Record<string, TextStyle> = {
  display: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 0.40,
  },
  largeTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: 0.37,
  },
  title1: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  title2: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.26,
  },
  title3: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.45,
  },
  headline: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.43,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.43,
  },
  bodyEmphasis: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.43,
  },
  bodyEmphasized: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.43,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  bodyLarge: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  callout: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  calloutEmphasized: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  subheadlineEmphasized: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  footnote: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  footnoteEmphasized: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption1: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption1Emphasized: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHTS.medium as any,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption2: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
  caption2Emphasized: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHTS.medium as any,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
};

/**
 * Dedicated Product Commerce Typography Hierarchy
 */
export const COMMERCE_TYPOGRAPHY: Record<string, TextStyle> = {
  productName: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  productNameDetail: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  productCategory: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHTS.medium as any,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  priceLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  priceMedium: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  priceSmall: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  originalPrice: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  stockBadge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  productMeta: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  productDescription: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  productSize: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0,
  },
  productColor: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHTS.medium as any,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0,
  },
};

/**
 * Dedicated Control & Navigation Typography Hierarchy
 */
export const CONTROL_TYPOGRAPHY: Record<string, TextStyle> = {
  button: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  buttonLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  buttonMedium: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  buttonSmall: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: -0.1,
  },
  chip: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHTS.medium as any,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0,
  },
  chipSelected: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0,
  },
  metadata: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
  badge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  navigationTitle: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHTS.semibold as any,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.4,
  },
  navigationSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  sectionHeader: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHTS.bold as any,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHTS.regular as any,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
};

/**
 * Unified Typography Export (Supports Apple HIG, Product Commerce, Controls & Backward-Compatibility)
 */
export const TYPOGRAPHY: Record<string, TextStyle> = {
  ...IOS_TYPOGRAPHY,
  ...COMMERCE_TYPOGRAPHY,
  ...CONTROL_TYPOGRAPHY,

  // Backward Compatibility Aliases for existing Premika components
  displayLarge: IOS_TYPOGRAPHY.largeTitle,
  displayMedium: IOS_TYPOGRAPHY.title1,
  displaySmall: IOS_TYPOGRAPHY.title2,
  titleLarge: IOS_TYPOGRAPHY.title3,
  titleMedium: IOS_TYPOGRAPHY.headline,
  titleSmall: IOS_TYPOGRAPHY.subheadlineEmphasized,
  labelLarge: IOS_TYPOGRAPHY.calloutEmphasized,
  labelMedium: IOS_TYPOGRAPHY.caption1Emphasized,
  labelSmall: IOS_TYPOGRAPHY.caption2Emphasized,
};

/**
 * Dynamic Type Accessibility Scaling Helper
 */
export function getScaledFontSize(baseFontSize: number): number {
  const fontScale = PixelRatio.getFontScale();
  // Bound scaling between 0.85x and 1.35x to preserve UI balance while respecting accessibility
  const clampedScale = Math.min(Math.max(fontScale, 0.85), 1.35);
  return Math.round(baseFontSize * clampedScale);
}

export type TypographyVariant = keyof typeof TYPOGRAPHY;
