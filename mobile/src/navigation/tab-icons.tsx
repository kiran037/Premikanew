/**
 * Premika Tab Icon Renderer
 * Dynamically resolves native SF Symbols for standalone iOS and SVG AppIcons for Expo Go / Android.
 */

import React from 'react';
import { TabItemConfig } from './tab-config';
import { AppIcon } from '@/components/ui/AppIcon';

export function getNativeTabIcon(config: TabItemConfig) {
  return ({ focused }: { focused: boolean }) => ({
    type: 'sfSymbol' as const,
    name: (focused ? config.sfSymbol.focused : config.sfSymbol.default) as any,
  });
}

export function getFallbackTabIcon(config: TabItemConfig) {
  return ({ focused, color }: { focused: boolean; color: string; size: number }) => {
    const isFilled = focused && (config.fallbackIcon === 'heart' || config.fallbackIcon === 'bag');
    return (
      <AppIcon
        name={config.fallbackIcon}
        size="tab"
        color={color}
        fill={isFilled ? color : 'transparent'}
      />
    );
  };
}
