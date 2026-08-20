/**
 * Premika 2.0 Editorial Global Header Bar Component
 * Translucent Liquid Glass navigation bar supporting branded logo, sidebar trigger, search, and reactive commerce actions.
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Heart, ShoppingBag, ChevronLeft, Menu } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { haptic } from '@/utils/haptics';

export interface HeaderBarProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showSearch?: boolean;
  showWishlist?: boolean;
  showCart?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  showBack = false,
  showMenu = false,
  showSearch = true,
  showWishlist = false,
  showCart = true,
  onBackPress,
  onMenuPress,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();

  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const cartCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const containerHeight = spacing.headerHeight + insets.top;

  const handleBackPress = () => {
    haptic.light();
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      openSidebar();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          height: containerHeight,
          paddingTop: insets.top,
          backgroundColor: colors.surfaceTranslucent,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={[styles.content, { paddingHorizontal: spacing.page }]}>
        {/* Left Slot: Menu Trigger or Back Button */}
        <View style={styles.leftSlot}>
          {showBack ? (
            <Pressable
              onPress={handleBackPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={22} color={colors.textPrimary} />
            </Pressable>
          ) : showMenu ? (
            <Pressable
              onPress={handleMenuPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Open application menu"
            >
              <Menu size={22} color={colors.textPrimary} />
            </Pressable>
          ) : (
            <Pressable onPress={() => router.push('/(tabs)')} style={styles.brandRow}>
              <Image
                source={require('../../../assets/logos/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Pressable>
          )}
        </View>

        {/* Center Slot: Brand Title or Page Title */}
        <View style={styles.centerSlot}>
          {title ? (
            <Text style={[typography.navigationTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <Pressable onPress={() => router.push('/(tabs)')} style={styles.brandTitleRow}>
              <Text style={[styles.brandTitleText, { color: colors.primary }]}>
                PREMIKA
              </Text>
            </Pressable>
          )}
        </View>

        {/* Right Slot: Action Icons */}
        <View style={styles.rightSlot}>
          {showSearch && (
            <Pressable
              onPress={() => {
                haptic.light();
                router.push('/search');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Search catalog"
            >
              <Search size={20} color={colors.textPrimary} />
            </Pressable>
          )}

          {showWishlist && (
            <Pressable
              onPress={() => {
                haptic.light();
                router.push('/(tabs)/wishlist');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={20} color={colors.textPrimary} />
              {wishlistCount > 0 && (
                <Badge
                  content={wishlistCount > 9 ? '9+' : wishlistCount}
                  variant="primary"
                  size="sm"
                  style={styles.badge}
                />
              )}
            </Pressable>
          )}

          {showCart && (
            <Pressable
              onPress={() => {
                haptic.light();
                router.push('/(tabs)/cart');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Cart with ${cartCount} items`}
            >
              <ShoppingBag size={20} color={colors.textPrimary} />
              {cartCount > 0 && (
                <Badge
                  content={cartCount > 9 ? '9+' : cartCount}
                  variant="primary"
                  size="sm"
                  style={styles.badge}
                />
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  leftSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    justifyContent: 'flex-start',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 28,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  brandTitleRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
    fontFamily: 'Urbanist_700Bold',
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 44,
    justifyContent: 'flex-end',
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
  },
});
