/**
 * Premika iOS 26 Native Navigation Configuration
 * Centralized SF Symbols, typography, and platform presets for Apple-native navigation
 */

import { Platform } from 'react-native';

export const NAVIGATION_SYMBOLS = {
  home: {
    focused: 'house.fill' as const,
    unfocused: 'house' as const,
  },
  categories: {
    focused: 'square.grid.2x2.fill' as const,
    unfocused: 'square.grid.2x2' as const,
  },
  wishlist: {
    focused: 'heart.fill' as const,
    unfocused: 'heart' as const,
  },
  cart: {
    focused: 'bag.fill' as const,
    unfocused: 'bag' as const,
  },
  account: {
    focused: 'person.crop.circle.fill' as const,
    unfocused: 'person.crop.circle' as const,
  },
  search: 'magnifyingglass' as const,
  back: 'chevron.backward' as const,
  settings: 'gearshape' as const,
  share: 'square.and.arrow.up' as const,
  close: 'xmark' as const,
  more: 'ellipsis' as const,
} as const;

export const NAVIGATION_METRICS = {
  headerContentHeight: 44,
  touchTargetSize: 44,
  iconSize: 22,
  backIconSize: 22,
  titleFontSize: 17,
  titleFontWeight: '600' as const,
  largeTitleFontSize: 34,
  largeTitleFontWeight: '700' as const,
};

export const isIOS = Platform.OS === 'ios';
