/**
 * Premika 2.0 Interactive Touch Target Dimensions & Accessibility Specifications
 * Enforces Apple HIG minimum 44pt touch bounding boxes and semantic hit-slops.
 */

import { Insets } from 'react-native';

export const TOUCH_TARGETS = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

export const CONTROL_HEIGHTS = {
  compact: 32,
  small: 36,
  medium: 48,
  large: 56,
} as const;

export const HIT_SLOP: Record<string, Insets> = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;

export const ACCESSIBILITY_TOKENS = {
  minimumTouchTarget: TOUCH_TARGETS.minimum,
  iconTouchTarget: TOUCH_TARGETS.minimum,
  minContrastRatio: 4.5,
  minLargeTextContrastRatio: 3.0,
} as const;
