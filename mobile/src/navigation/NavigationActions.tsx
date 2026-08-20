/**
 * Premika 2.0 Native Navigation Bar Action Components & Global Action Map
 * Provides standard headerRight & headerLeft actions (Menu, Cart, Wishlist, Search, Close, Back) with reactive badges.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { haptic } from '@/utils/haptics';

export const HeaderMenuButton: React.FC = () => {
  const { colors } = useTheme();
  const openSidebar = useSidebarStore((state) => state.openSidebar);

  return (
    <Pressable
      onPress={openSidebar}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.actionBtn}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Open application menu"
    >
      <AppIcon name="filter" size="navigation" color={colors.textPrimary} />
    </Pressable>
  );
};

export const HeaderCartButton: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const cartCount = useCartStore((state) => state.getItemCount());

  const handlePress = () => {
    haptic.light();
    router.push('/(tabs)/cart');
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.actionBtn}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Cart with ${cartCount} items`}
    >
      <AppIcon name="bag" size="navigation" color={colors.textPrimary} />
      {cartCount > 0 && (
        <Badge
          content={cartCount > 9 ? '9+' : cartCount}
          variant="primary"
          size="sm"
          style={styles.badge}
        />
      )}
    </Pressable>
  );
};

export const HeaderWishlistButton: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const handlePress = () => {
    haptic.light();
    router.push('/(tabs)/wishlist');
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.actionBtn}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Wishlist with ${wishlistCount} items`}
    >
      <AppIcon name="heart" size="navigation" color={colors.textPrimary} />
      {wishlistCount > 0 && (
        <Badge
          content={wishlistCount > 9 ? '9+' : wishlistCount}
          variant="primary"
          size="sm"
          style={styles.badge}
        />
      )}
    </Pressable>
  );
};

export const HeaderSearchButton: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    haptic.light();
    router.push('/search');
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.actionBtn}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Search catalog"
    >
      <AppIcon name="search" size="navigation" color={colors.textPrimary} />
    </Pressable>
  );
};

export const HeaderBackButton: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    haptic.light();
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.actionBtn}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <AppIcon name="chevron-left" size="navigation" color={colors.textPrimary} />
    </Pressable>
  );
};

export const HeaderCloseButton: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    haptic.light();
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.actionBtn}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Close"
    >
      <AppIcon name="close" size="navigation" color={colors.textPrimary} />
    </Pressable>
  );
};

export const HeaderActionsGroup: React.FC<{
  showSearch?: boolean;
  showWishlist?: boolean;
  showCart?: boolean;
  showMenu?: boolean;
}> = ({
  showSearch = false,
  showWishlist = false,
  showCart = true,
  showMenu = false,
}) => {
  return (
    <View style={styles.groupContainer}>
      {showSearch && <HeaderSearchButton />}
      {showWishlist && <HeaderWishlistButton />}
      {showCart && <HeaderCartButton />}
      {showMenu && <HeaderMenuButton />}
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
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
