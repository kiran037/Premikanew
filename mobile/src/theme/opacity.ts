/**
 * Premika Semantic Opacity Scale
 * Standardizes transparency levels across overlays, disabled states & pressed feedback.
 */

export const OPACITY = {
  opaque: 1,
  high: 0.85,
  medium: 0.60,
  subtle: 0.35,
  faint: 0.15,
  disabled: 0.40,
  pressed: 0.70,
  overlay: 0.45,
  overlaySubtle: 0.25,
  backdrop: 0.50,
} as const;

export type Opacity = keyof typeof OPACITY;
