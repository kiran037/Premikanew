/**
 * Premika 2.0 Editorial Fashion Home Screen
 * Displays New Arrivals, Featured Collection, Category Discovery & Recently Viewed with fluid horizontal rails.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, Flame, LayoutGrid, Clock } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { HeaderBar } from '@/components/common/HeaderBar';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { ProductRail } from '@/components/product/ProductRail';
import { CategoryRail } from '@/components/category/CategoryRail';
import { HomeBrandIntro } from '@/components/home/HomeBrandIntro';
import { ErrorState } from '@/components/ui/ErrorState';
import { Product, Category } from '@/api/types';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { useRecentStore } from '@/store/recent-store';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recentlyViewed = useRecentStore((state) => state.recentlyViewed);

  const loadHomeData = useCallback(async () => {
    setError(null);
    try {
      const [cats, feat, newArr] = await Promise.all([
        categoriesApi.getCategories(),
        productsApi.getFeaturedProducts(8),
        productsApi.getNewArrivals(8),
      ]);

      setCategories(cats);
      setFeaturedProducts(feat);
      setNewArrivals(newArr);
    } catch (err: any) {
      setError(err.message || 'Failed to load home storefront content');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadHomeData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Global Branded Header */}
      <HeaderBar
        showBack={false}
        showMenu={true}
        showSearch={true}
        showWishlist={false}
        showCart={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.bottomBarHeight + insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Contextual Editorial Brand Statement */}
        <HomeBrandIntro />

        {/* Error State if initial fetch failed */}
        {error && !isLoading ? (
          <View style={{ padding: spacing.page }}>
            <ErrorState message={error} onRetry={loadHomeData} />
          </View>
        ) : null}

        {/* 2. New Arrivals (First Major Shopping Content Block) */}
        <Section>
          <SectionHeader
            title="New Arrivals"
            subtitle="Fresh silhouettes from the atelier"
            icon={<Sparkles size={18} color={colors.primary} />}
            actionTitle="See All"
            onAction={() => router.push('/(tabs)/categories')}
          />
          <ProductRail
            products={newArrivals}
            isLoading={isLoading}
          />
        </Section>

        {/* 3. Featured Products Collection */}
        <Section>
          <SectionHeader
            title="Featured Collection"
            subtitle="Handcrafted signature ensembles"
            icon={<Flame size={18} color={colors.primary} />}
            actionTitle="See All"
            onAction={() => router.push('/(tabs)/categories')}
          />
          <ProductRail
            products={featuredProducts}
            isLoading={isLoading}
            cardWidth={172}
          />
        </Section>

        {/* 4. Shop By Category Horizontal Discovery Rail */}
        <Section>
          <SectionHeader
            title="Shop Categories"
            subtitle="Explore by curated silhouette"
            icon={<LayoutGrid size={18} color={colors.primary} />}
            actionTitle="All Categories"
            onAction={() => router.push('/(tabs)/categories')}
          />
          <CategoryRail
            categories={categories}
            isLoading={isLoading}
          />
        </Section>

        {/* 5. Recently Viewed Section (Shown Only When History Exists) */}
        {recentlyViewed.length > 0 && (
          <Section>
            <SectionHeader
              title="Recently Viewed"
              subtitle="Pick up where you left off"
              icon={<Clock size={18} color={colors.primary} />}
            />
            <ProductRail
              products={recentlyViewed}
              cardWidth={140}
            />
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
