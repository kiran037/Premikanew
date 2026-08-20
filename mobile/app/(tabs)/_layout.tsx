/**
 * Premika Bottom Tab Navigation Layout
 * Apple-Native iOS 26 Liquid Glass Bottom Tabs Navigator
 * 5 Primary Tabs: Home, Categories, Wishlist, Cart, Account
 */

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useCartStore } from '@/store/cart-store';
import { NativeTabs } from '@/navigation/NativeTabs';
import { TAB_CONFIG } from '@/navigation/tab-config';
import { getNativeTabIcon } from '@/navigation/tab-icons';

export default function TabsLayout() {
  const { colors } = useTheme();
  const cartCount = useCartStore((state) => state.getItemCount());

  return (
    <NativeTabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarControllerMode: 'auto',
        overrideScrollViewContentInsetAdjustmentBehavior: true,
      }}
    >
      {TAB_CONFIG.map((tab) => {
        const isCart = tab.name === 'cart';
        return (
          <NativeTabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarLabel: tab.title,
              tabBarMinimizeBehavior: tab.minimizeBehavior,
              tabBarBadge: isCart && cartCount > 0 ? (cartCount > 9 ? '9+' : cartCount) : undefined,
              tabBarBadgeStyle: {
                backgroundColor: colors.primary,
              },
              tabBarIcon: getNativeTabIcon(tab),
            }}
          />
        );
      })}
    </NativeTabs>
  );
}
