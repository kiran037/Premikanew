/**
 * Premika 2.0 Customer & Guest Account Hub Screen
 * Profile identity header, structured shopping & address navigation groups, and authentication controls.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  ShoppingBag,
  Heart,
  Package,
  MapPin,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  LogIn,
  LogOut,
  Edit3,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { HeaderBar } from '@/components/common/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { haptic } from '@/utils/haptics';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius } = useTheme();

  const customer = useAuthStore((state) => state.customer);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);

  const displayName = customer
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.phone || customer.email || 'Customer'
    : 'Welcome to Premika';

  const displaySubtitle = customer
    ? customer.email || customer.phone || 'Authenticated Account'
    : 'Browse collections & save items';

  const handleLogout = () => {
    haptic.light();
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your Premika account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          haptic.medium();
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar
        title="Account"
        showBack={false}
        showMenu={true}
        showSearch={false}
        showWishlist={false}
        showCart={true}
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.page,
          paddingBottom: spacing.bottomBarHeight + insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Customer / Guest Identity Hero */}
        <Card
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              borderRadius: radius.card,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.heroRow}>
            <View
              style={[
                styles.avatarBox,
                {
                  backgroundColor: isAuthenticated ? colors.primary : colors.accent,
                },
              ]}
            >
              {customer?.avatarUrl ? (
                <Image source={{ uri: customer.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <User size={30} color={isAuthenticated ? '#FFFFFF' : colors.primary} />
              )}
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <View style={styles.nameBadgeRow}>
                <Text style={[typography.titleLarge, { color: colors.textPrimary }]} numberOfLines={1}>
                  {displayName}
                </Text>
                <Badge
                  content={isAuthenticated ? 'MEMBER' : 'GUEST'}
                  variant={isAuthenticated ? 'primary' : 'secondary'}
                  size="sm"
                />
              </View>

              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                {displaySubtitle}
              </Text>
            </View>
          </View>

          {isAuthenticated ? (
            <View style={[styles.authActionsRow, { gap: spacing.sm, marginTop: spacing.md }]}>
              <Button
                title="Edit Profile"
                onPress={() => {
                  haptic.light();
                  router.push('/profile/edit' as any);
                }}
                variant="outline"
                size="sm"
                leftIcon={<Edit3 size={15} color={colors.textPrimary} />}
                style={{ flex: 1 }}
              />
              <Button
                title="Sign Out"
                onPress={handleLogout}
                variant="ghost"
                size="sm"
                leftIcon={<LogOut size={15} color="#EF4444" />}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            <Button
              title="Sign In / Register"
              onPress={() => {
                haptic.light();
                router.push('/auth' as any);
              }}
              variant="primary"
              size="md"
              leftIcon={<LogIn size={18} color="#FFFFFF" />}
              style={{ marginTop: spacing.md }}
            />
          )}
        </Card>

        {/* 2. Shopping Navigation Group */}
        <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
          Shopping
        </Text>

        <Card
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              borderRadius: radius.card,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              haptic.light();
              router.push('/(tabs)/cart');
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <ShoppingBag size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                My Shopping Bag
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.borderSubtle }]} />

          <Pressable
            onPress={() => {
              haptic.light();
              router.push('/(tabs)/wishlist');
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Heart size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                My Wishlist
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.borderSubtle }]} />

          <Pressable
            onPress={() => {
              haptic.light();
              if (isAuthenticated) {
                router.push('/orders' as any);
              } else {
                router.push({ pathname: '/auth', params: { redirect: '/orders' } } as any);
              }
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Package size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                Order History & Tracking
              </Text>
            </View>
            {isAuthenticated ? (
              <ChevronRight size={16} color={colors.textMuted} />
            ) : (
              <Badge content="GUEST" variant="secondary" size="sm" />
            )}
          </Pressable>
        </Card>

        {/* 3. Account & Addresses Group */}
        <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
          Account & Preferences
        </Text>

        <Card
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              borderRadius: radius.card,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              haptic.light();
              if (isAuthenticated) {
                router.push('/addresses' as any);
              } else {
                router.push({ pathname: '/auth', params: { redirect: '/addresses' } } as any);
              }
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <MapPin size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                Saved Delivery Addresses
              </Text>
            </View>
            {isAuthenticated ? (
              <ChevronRight size={16} color={colors.textMuted} />
            ) : (
              <Badge content="GUEST" variant="secondary" size="sm" />
            )}
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.borderSubtle }]} />

          <Pressable
            onPress={() => {
              haptic.light();
              router.push('/settings' as any);
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <SettingsIcon size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                Settings & Preferences
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.borderSubtle }]} />

          <Pressable
            onPress={() => {
              haptic.light();
              router.push('/settings' as any);
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <HelpCircle size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                Help & Customer Support
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.borderSubtle }]} />

          <Pressable
            onPress={() => {
              haptic.light();
              router.push('/settings' as any);
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <ShieldCheck size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                Privacy Policy & Terms
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>
        </Card>

        {/* 4. App Version Info */}
        <View style={styles.versionFooter}>
          <Image
            source={require('../../assets/logos/logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={[typography.caption1, { color: colors.textMuted, marginTop: 6 }]}>
            Premika Mobile v1.0.0 — Modern iOS Build
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authActionsRow: {
    flexDirection: 'row',
  },
  menuCard: {
    padding: 0,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 28,
  },
  footerLogo: {
    width: 32,
    height: 32,
    opacity: 0.6,
  },
});
