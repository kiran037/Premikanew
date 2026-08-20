/**
 * Premika 2.0 Wishlist & Saved Styles Screen
 * Curated product collection with instant removal reactivity, server sync, and empty states.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { HeaderBar } from '@/components/common/HeaderBar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { haptic } from '@/utils/haptics';

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();

  const session = useAuthStore((state) => state.session);
  const token = session?.access_token;

  const items = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const fetchServerWishlist = useWishlistStore((state) => state.fetchServerWishlist);

  useEffect(() => {
    if (token) {
      fetchServerWishlist(token);
    }
  }, [token, fetchServerWishlist]);

  const handleClearAll = () => {
    haptic.light();
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all saved styles?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            haptic.medium();
            clearWishlist();
          },
        },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <HeaderBar
          title="My Wishlist"
          showBack={false}
          showMenu={true}
          showSearch={true}
          showWishlist={false}
          showCart={true}
        />
        <View style={styles.center}>
          <EmptyState
            title="Your Wishlist is Empty"
            description="Explore our atelier collections and tap the heart icon to save your favorite styles."
            icon={<Heart size={48} color={colors.primary} />}
            actionTitle="Discover Products"
            onAction={() => router.push('/(tabs)')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar
        title="My Wishlist"
        showBack={false}
        showMenu={true}
        showSearch={true}
        showWishlist={false}
        showCart={true}
      />

      <View
        style={[
          styles.headerRow,
          {
            paddingHorizontal: spacing.page,
            paddingVertical: spacing.xs,
            backgroundColor: colors.surfaceElevated,
            borderBottomColor: colors.borderSubtle,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
          Saved Styles ({items.length})
        </Text>

        <Pressable
          onPress={handleClearAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Clear all saved styles"
        >
          <Trash2 size={15} color={colors.textMuted} />
          <Text style={[typography.caption1, { color: colors.textMuted, marginLeft: 4 }]}>
            Clear
          </Text>
        </Pressable>
      </View>

      <ProductGrid
        products={items}
        contentContainerStyle={{
          paddingBottom: spacing.bottomBarHeight + insets.bottom + 24,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
});
