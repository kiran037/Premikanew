/**
 * Premika 2.0 Semantic Material System (iOS Blur & Vibrancy Materials)
 * Abstracts hardware blur materials for navigation, toolbars, sheets & floating controls.
 *
 * Preferred Material Hierarchy:
 * 1. SYSTEM LIQUID GLASS: Native iOS tab bar, native navigation chrome, native sheets
 * 2. SECONDARY GLASS: Contextual floating controls, floating commerce action bar, temporary action surfaces
 * 3. SOLID CONTENT SURFACES: Product cards, category cards, product imagery, product grids, price blocks
 */

import { Platform } from 'react-native';

export const MATERIALS = {
  // Blur Intensities
  none: 0,
  ultraThin: 20,
  thin: 35,
  regular: 55,
  thick: 75,
  chrome: 90,
  prominent: 95,
} as const;

export type MaterialVariant = keyof typeof MATERIALS;

export const MATERIAL_TINTS = {
  light: 'light',
  dark: 'dark',
  default: 'default',
  prominent: 'prominent',
  regular: 'regular',
  extraLight: 'extraLight',
} as const;

export const IS_NATIVE_BLUR_SUPPORTED = Platform.OS === 'ios';

export interface MaterialConfig {
  material?: MaterialVariant;
  intensity?: number;
  tint?: keyof typeof MATERIAL_TINTS;
  showBorder?: boolean;
  interactive?: boolean;
}
