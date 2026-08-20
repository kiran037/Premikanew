/**
 * Premika Centralized Tab Navigation Configuration
 * Defines authoritative metadata, SF Symbol mappings, and fallback icon tokens for all 5 root tabs.
 */

import { IconName } from '@/theme/icons';

export interface TabItemConfig {
  name: string;
  title: string;
  sfSymbol: {
    focused: string;
    default: string;
  };
  fallbackIcon: IconName;
  accessibilityLabel: string;
  minimizeBehavior: 'onScrollDown' | 'none';
}

export const TAB_CONFIG: TabItemConfig[] = [
  {
    name: 'index',
    title: 'Home',
    sfSymbol: {
      focused: 'house.fill',
      default: 'house',
    },
    fallbackIcon: 'home',
    accessibilityLabel: 'Home tab',
    minimizeBehavior: 'onScrollDown',
  },
  {
    name: 'categories',
    title: 'Categories',
    sfSymbol: {
      focused: 'square.grid.2x2.fill',
      default: 'square.grid.2x2',
    },
    fallbackIcon: 'categories',
    accessibilityLabel: 'Categories tab',
    minimizeBehavior: 'onScrollDown',
  },
  {
    name: 'wishlist',
    title: 'Wishlist',
    sfSymbol: {
      focused: 'heart.fill',
      default: 'heart',
    },
    fallbackIcon: 'heart',
    accessibilityLabel: 'Wishlist tab',
    minimizeBehavior: 'onScrollDown',
  },
  {
    name: 'cart',
    title: 'Cart',
    sfSymbol: {
      focused: 'bag.fill',
      default: 'bag',
    },
    fallbackIcon: 'bag',
    accessibilityLabel: 'Cart tab',
    minimizeBehavior: 'none',
  },
  {
    name: 'account',
    title: 'Account',
    sfSymbol: {
      focused: 'person.crop.circle.fill',
      default: 'person.crop.circle',
    },
    fallbackIcon: 'user',
    accessibilityLabel: 'Account tab',
    minimizeBehavior: 'none',
  },
];
