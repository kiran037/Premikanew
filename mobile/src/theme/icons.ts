/**
 * Premika Centralized Icon Scale & System Abstraction
 * Standardizes icon dimensions across buttons, navigation headers, tabs & cards.
 */

export const ICON_SIZES = {
  xs: 14,
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
  navigation: 22,
  toolbar: 20,
  tab: 24,
  hero: 48,
} as const;

export type IconSize = keyof typeof ICON_SIZES | number;

/**
 * Standard Semantic Icon Names across Premika
 */
export type IconName =
  | 'home'
  | 'grid'
  | 'categories'
  | 'heart'
  | 'heart-filled'
  | 'cart'
  | 'bag'
  | 'user'
  | 'search'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-right'
  | 'arrow-left'
  | 'check'
  | 'check-circle'
  | 'trash'
  | 'settings'
  | 'shield'
  | 'package'
  | 'pin'
  | 'map-pin'
  | 'truck'
  | 'star'
  | 'tag'
  | 'phone'
  | 'mail'
  | 'camera'
  | 'edit'
  | 'lock'
  | 'info'
  | 'refresh'
  | 'filter'
  | 'sparkles'
  | 'flame'
  | 'clock';

export function resolveIconSize(size: IconSize): number {
  if (typeof size === 'number') return size;
  return ICON_SIZES[size] || ICON_SIZES.medium;
}
