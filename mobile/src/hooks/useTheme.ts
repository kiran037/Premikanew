/**
 * Custom hook to access reactive Premika 2.0 theme color tokens and properties
 */

import { useColorScheme } from 'react-native';
import {
  LIGHT_THEME,
  DARK_THEME,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  GLASS_TOKENS,
  MATERIALS,
  MEDIA_ASPECT_RATIOS,
  ICON_SIZES,
  TOUCH_TARGETS,
  HIT_SLOP,
  OPACITY,
  BORDER_WIDTH,
  BORDERS,
  MOTION,
} from '@/theme';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  return {
    isDark,
    colorScheme: colorScheme || 'light',
    colors,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    typography: TYPOGRAPHY,
    glass: GLASS_TOKENS,
    materials: MATERIALS,
    media: MEDIA_ASPECT_RATIOS,
    icons: ICON_SIZES,
    touchTargets: TOUCH_TARGETS,
    hitSlop: HIT_SLOP,
    opacity: OPACITY,
    borderWidth: BORDER_WIDTH,
    borders: BORDERS,
    motion: MOTION,
  };
}
