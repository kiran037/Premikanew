/**
 * Premika 2.0 Root Navigation Layout
 * Native iOS Navigation Stack with Large Titles, Native Back Gestures & Global Sidebar Drawer
 */

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/auth-store';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SidebarDrawer } from '@/components/navigation/SidebarDrawer';
import { HeaderCartButton, HeaderActionsGroup } from '@/navigation/NavigationActions';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark, colors, typography } = useTheme();
  const initializeAuth = useAuthStore((state) => state.initialize);

  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.primary,
              headerTitleStyle: {
                fontFamily: 'Urbanist_600SemiBold',
                fontWeight: '600',
                fontSize: 17,
                color: colors.textPrimary,
              },
              headerLargeTitleStyle: {
                fontFamily: 'Urbanist_700Bold',
                fontWeight: '700',
                fontSize: 34,
                color: colors.textPrimary,
              },
              headerBackTitle: 'Back',
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.background },
              animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
            }}
          >
            {/* Root 5-Tab Shell */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Product Detail Screen */}
            <Stack.Screen
              name="product/[slug]"
              options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: false,
                headerBackTitle: 'Back',
                headerRight: () => <HeaderActionsGroup showWishlist showCart />,
              }}
            />

            {/* Category Detail Screen */}
            <Stack.Screen
              name="category/[slug]"
              options={{
                headerShown: true,
                headerTitle: 'Collection',
                headerLargeTitle: true,
                headerBackTitle: 'Back',
                headerRight: () => <HeaderActionsGroup showSearch showCart />,
              }}
            />

            {/* Search Screen */}
            <Stack.Screen
              name="search"
              options={{
                headerShown: true,
                headerTitle: 'Search',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderCartButton />,
              }}
            />

            {/* Checkout Flow */}
            <Stack.Screen
              name="checkout/index"
              options={{
                headerShown: true,
                headerTitle: 'Checkout',
                headerBackTitle: 'Cart',
              }}
            />
            <Stack.Screen
              name="checkout/confirmation"
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />

            {/* Passwordless Auth Modal */}
            <Stack.Screen
              name="auth/index"
              options={{
                headerShown: true,
                headerTitle: 'Sign In',
                presentation: 'modal',
                headerBackTitle: 'Close',
              }}
            />

            {/* Profile Editor */}
            <Stack.Screen
              name="profile/edit"
              options={{
                headerShown: true,
                headerTitle: 'Edit Profile',
                headerBackTitle: 'Account',
              }}
            />

            {/* Address Management */}
            <Stack.Screen
              name="addresses/index"
              options={{
                headerShown: true,
                headerTitle: 'Saved Addresses',
                headerLargeTitle: true,
                headerBackTitle: 'Account',
              }}
            />
            <Stack.Screen
              name="addresses/manage"
              options={{
                headerShown: true,
                headerTitle: 'Address',
                presentation: 'formSheet',
                headerBackTitle: 'Cancel',
              }}
            />

            {/* Order History & Tracking */}
            <Stack.Screen
              name="orders/index"
              options={{
                headerShown: true,
                headerTitle: 'Order History',
                headerLargeTitle: true,
                headerBackTitle: 'Account',
                headerRight: () => <HeaderCartButton />,
              }}
            />
            <Stack.Screen
              name="orders/[orderNumber]"
              options={{
                headerShown: true,
                headerTitle: 'Order Details',
                headerBackTitle: 'Orders',
                headerRight: () => <HeaderCartButton />,
              }}
            />

            {/* Settings & Preferences */}
            <Stack.Screen
              name="settings/index"
              options={{
                headerShown: true,
                headerTitle: 'Settings',
                headerLargeTitle: true,
                headerBackTitle: 'Account',
                headerRight: () => <HeaderCartButton />,
              }}
            />
          </Stack>

          {/* Global Sidebar Drawer */}
          <SidebarDrawer />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
