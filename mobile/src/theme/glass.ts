/**
 * Premika 2.0 Liquid Glass Design System Specifications & Rules
 *
 * Glass Material Usage Rules:
 * - GLASS IS FOR:
 *   - Native navigation bar & toolbar chrome
 *   - Native bottom tab bar
 *   - Contextual floating controls & sticky bottom commerce action bars
 *   - Native sheet backdrops & modals
 *   - Compact floating utility pills
 *
 * - GLASS IS NOT FOR:
 *   - Every product card or catalog item (Use solid surfaces with subtle border)
 *   - Every category card
 *   - Product images
 *   - Screen root backgrounds
 *   - Dense scrolling table rows
 */

import { MATERIALS, IS_NATIVE_BLUR_SUPPORTED } from './materials';
export { IS_NATIVE_BLUR_SUPPORTED };

export const GLASS_TOKENS = {
  // Apple Blur Intensity Scale
  blurIntensity: {
    subtle: MATERIALS.thin,
    regular: MATERIALS.regular,
    prominent: MATERIALS.thick,
    intense: MATERIALS.prominent,
  },

  // Apple Translucency Gradients & Tints
  light: {
    surfaceBg: 'rgba(255, 255, 255, 0.65)',
    cardBg: 'rgba(255, 255, 255, 0.78)',
    floatingBg: 'rgba(255, 255, 255, 0.85)',
    navigationBg: 'rgba(255, 255, 255, 0.72)',
    controlBg: 'rgba(255, 255, 255, 0.60)',
    overlayBg: 'rgba(20, 10, 10, 0.40)',

    borderHighlight: 'rgba(255, 255, 255, 0.40)',
    borderSubtle: 'rgba(230, 220, 212, 0.60)',
  },

  dark: {
    surfaceBg: 'rgba(30, 22, 22, 0.68)',
    cardBg: 'rgba(40, 30, 30, 0.78)',
    floatingBg: 'rgba(50, 37, 37, 0.85)',
    navigationBg: 'rgba(18, 12, 12, 0.72)',
    controlBg: 'rgba(60, 45, 45, 0.60)',
    overlayBg: 'rgba(0, 0, 0, 0.60)',

    borderHighlight: 'rgba(255, 255, 255, 0.22)',
    borderSubtle: 'rgba(255, 255, 255, 0.10)',
  },

  // Android Fallback Materials (High performance, battery friendly)
  androidFallback: {
    lightBg: 'rgba(255, 255, 255, 0.94)',
    darkBg: 'rgba(24, 18, 18, 0.95)',
    borderColor: 'rgba(120, 32, 30, 0.15)',
  },
} as const;

export interface GlassConfig {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'regular' | 'prominent';
  borderWidth?: number;
}
