/**
 * Premika 2.0 Hybrid Native Bottom Tabs Navigator
 * Connects iOS 26 Liquid Glass Fabric Native Tabs on iOS dev builds with high-performance Expo Go & Android fallback.
 */

import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type {
  NativeBottomTabNavigationOptions,
  NativeBottomTabNavigationEventMap,
} from '@react-navigation/bottom-tabs/unstable';
import { withLayoutContext, Tabs as ExpoTabs } from 'expo-router';
import type { TabNavigationState, ParamListBase } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { IS_NATIVE_BLUR_SUPPORTED } from '@/theme/materials';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/theme/icons';
import { haptic } from '@/utils/haptics';

export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === 'expo' ||
  Platform.OS === 'web';

const mapSymbolToFallbackIcon = (name: string): { icon: IconName; isFilled: boolean } => {
  if (name.includes('house')) return { icon: 'home', isFilled: name.includes('fill') };
  if (name.includes('grid')) return { icon: 'categories', isFilled: name.includes('fill') };
  if (name.includes('heart')) return { icon: 'heart', isFilled: name.includes('fill') };
  if (name.includes('bag')) return { icon: 'bag', isFilled: name.includes('fill') };
  if (name.includes('person')) return { icon: 'user', isFilled: name.includes('fill') };
  return { icon: 'home', isFilled: false };
};

function ExpoGoTabsWrapper({ children, screenOptions, ...rest }: any) {
  const { colors, isDark } = useTheme();

  return (
    <ExpoTabs
      screenOptions={(screenProps) => {
        const baseOptions = typeof screenOptions === 'function' ? screenOptions(screenProps) : screenOptions || {};
        return {
          ...baseOptions,
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: 'Urbanist_600SemiBold',
            fontWeight: '600',
            marginTop: -2,
          },
          tabBarStyle: {
            backgroundColor: colors.surfaceTranslucent,
            borderTopColor: colors.borderSubtle,
            borderTopWidth: StyleSheet.hairlineWidth,
            elevation: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 6,
            ...baseOptions.tabBarStyle,
          },
          tabBarBackground: () => (
            IS_NATIVE_BLUR_SUPPORTED ? (
              <BlurView
                tint={isDark ? 'dark' : 'light'}
                intensity={85}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: isDark ? colors.surface : colors.surfaceElevated },
                ]}
              />
            )
          ),
        };
      }}
      {...rest}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const origOptions = (child.props as any)?.options || {};
        const origTabBarIcon = origOptions.tabBarIcon;

        const adaptedOptions = {
          ...origOptions,
          tabBarIcon: origTabBarIcon
            ? ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
                const iconResult = typeof origTabBarIcon === 'function' ? origTabBarIcon({ focused, color, size }) : origTabBarIcon;
                if (iconResult && typeof iconResult === 'object' && iconResult.type === 'sfSymbol') {
                  const { icon, isFilled } = mapSymbolToFallbackIcon(iconResult.name);
                  return (
                    <AppIcon
                      name={icon}
                      size="tab"
                      color={color}
                      fill={isFilled && (icon === 'heart' || icon === 'bag') ? color : 'transparent'}
                    />
                  );
                }
                return iconResult;
              }
            : undefined,
        };

        return React.cloneElement(child as React.ReactElement<any>, {
          options: adaptedOptions,
          listeners: {
            tabPress: () => {
              haptic.selection();
            },
          },
        });
      })}
    </ExpoTabs>
  );
}

ExpoGoTabsWrapper.Screen = ExpoTabs.Screen;

function createNativeNavigator() {
  if (isExpoGo) {
    return ExpoGoTabsWrapper;
  }
  try {
    const { createNativeBottomTabNavigator } = require('@react-navigation/bottom-tabs/unstable');
    const { Navigator } = createNativeBottomTabNavigator();
    return withLayoutContext<
      NativeBottomTabNavigationOptions,
      typeof Navigator,
      TabNavigationState<ParamListBase>,
      NativeBottomTabNavigationEventMap
    >(Navigator);
  } catch {
    return ExpoGoTabsWrapper;
  }
}

export type NativeTabsType = ReturnType<typeof withLayoutContext<
  NativeBottomTabNavigationOptions,
  any,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>>;

export const NativeTabs: NativeTabsType = (isExpoGo ? ExpoGoTabsWrapper : createNativeNavigator()) as unknown as NativeTabsType;
