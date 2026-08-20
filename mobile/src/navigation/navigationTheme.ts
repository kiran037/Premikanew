/**
 * Premika 2.0 iOS Native Navigation Theme Adaptor
 * Provides reactive semantic colors and translucent materials for native navigation chrome.
 */

import { ColorSchemeName } from 'react-native';
import { LIGHT_THEME, DARK_THEME, BRAND_PALETTE } from '@/theme/colors';

export function getNavigationColors(colorScheme: ColorSchemeName) {
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  return {
    isDark,
    headerBackground: theme.glassBg,
    headerBorder: theme.borderSubtle,
    titleColor: theme.textPrimary,
    tintColor: theme.primary,
    inactiveTint: theme.textMuted,
    badgeBackground: theme.primary,
    badgeText: theme.primaryForeground,
  };
}
