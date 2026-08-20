/**
 * Premika 2.0 Native Motion & Spring Physics Specifications
 * Adheres to Apple iOS interactive response curves & spring dynamics.
 * Includes press interaction scales and reduced-motion accessibility helpers.
 */

import { WithSpringConfig, WithTimingConfig, Easing } from 'react-native-reanimated';

export const DURATION = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  modal: 400,
} as const;

export const SPRING = {
  // Snappy: button presses, chip selection, micro-interactions
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  } as WithSpringConfig,

  // Standard: sheet expansion, tab transitions, card expands
  standard: {
    damping: 18,
    stiffness: 220,
    mass: 1,
  } as WithSpringConfig,

  // Gentle: subtle layout shifts, toast entrances
  gentle: {
    damping: 25,
    stiffness: 120,
    mass: 1,
  } as WithSpringConfig,

  // Bouncy: celebration, badge pops, delight animations
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.8,
  } as WithSpringConfig,

  // Sheet & Modal Presentations
  sheet: {
    damping: 22,
    stiffness: 240,
    mass: 1,
  } as WithSpringConfig,

  // Emphasis: highlight pulse
  emphasis: {
    damping: 14,
    stiffness: 200,
    mass: 0.9,
  } as WithSpringConfig,
} as const;

export const PRESS_SCALE = {
  primaryButton: 0.97,
  secondaryButton: 0.97,
  icon: 0.92,
  card: 0.98,
  chip: 0.96,
  wishlist: 0.88,
  subtle: 0.99,
  none: 1.0,
} as const;

export const TIMING = {
  fadeFast: {
    duration: DURATION.fast,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  fadeNormal: {
    duration: DURATION.normal,
    easing: Easing.out(Easing.quad),
  } as WithTimingConfig,

  slideNormal: {
    duration: DURATION.normal,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,
} as const;

/**
 * Reduced-motion helper: returns immediate timing or clamped spring if reduced motion is preferred
 */
export function getAccessibleSpring(baseSpring: WithSpringConfig, isReducedMotion: boolean): WithSpringConfig {
  if (isReducedMotion) {
    return {
      damping: 40,
      stiffness: 400,
      mass: 0.5,
    } as WithSpringConfig;
  }
  return baseSpring;
}

export function getAccessiblePressScale(scale: number, isReducedMotion: boolean): number {
  if (isReducedMotion) return 1.0;
  return scale;
}

export const MOTION = {
  duration: DURATION,
  spring: SPRING,
  timing: TIMING,
  pressScale: PRESS_SCALE,
} as const;
