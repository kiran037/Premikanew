/**
 * Premika Animation Utilities & Presets
 * Shared Reanimated configurations for spring dynamics, transitions & gesture responses.
 */

import { SPRING, TIMING, DURATION } from '@/theme/motion';

export const ANIMATION_PRESETS = {
  // Spring Presets
  springBouncy: SPRING.bouncy,
  springSnappy: SPRING.snappy,
  springGentle: SPRING.gentle,
  springStandard: SPRING.standard,

  // Timing Presets
  fadeFast: TIMING.fadeFast,
  fadeNormal: TIMING.fadeNormal,
  slideNormal: TIMING.slideNormal,
} as const;

export { SPRING, TIMING, DURATION };
