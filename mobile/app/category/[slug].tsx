/**
 * Premika 2.0 Category Detail & Product Discovery Storefront Screen
 * Dynamic collection storefront with filter/sort chips and infinite scrolling 2-column product grid.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Chip } from '@/components/ui/Chip';
import { Product, Category, SortOption } from '@/api/types';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { HeaderActionsGroup } from '@/navigation/NavigationActions';

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortOption>('newest');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryProducts = useCallback(async () => {
    if (!slug) return;
    setError(null);
    try {
      const [catData, prodData] = await Promise.all([
        categoriesApi.getCategoryBySlug(slug),
        productsApi.getProducts({ category: slug, sort, page: 1, limit: 20 }),
      ]);
      setCategoryInfo(catData);
      setProducts(prodData.items);
      setPage(1);
      const totalPages = prodData.pagination?.totalPages || 1;
      setHasMore(1 < totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load category products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [slug, sort]);

  useEffect(() => {
    setIsLoading(true);
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCategoryProducts();
  };

  const handleLoadMore = async () => {
    if (!slug || isLoading || isLoadingMore || isRefreshing || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await productsApi.getProducts({
        category: slug,
        sort,
        page: nextPage,
        limit: 20,
      });

      if (res.items && res.items.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewItems = res.items.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewItems];
        });
        setPage(nextPage);
        const totalPages = res.pagination?.totalPages || nextPage;
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      if (__DEV__) console.warn('[CategoryDetail] Failed to load more products:', err.message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const dynamicTitle = categoryInfo
    ? categoryInfo.name
    : slug
    ? slug.charAt(0).toUpperCase() + slug.slice(1)
    : 'Collection';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerTitle: dynamicTitle,
          headerRight: () => <HeaderActionsGroup showSearch showCart />,
        }}
      />

      {/* Sorting Filter Rail Header */}
      <View
        style={[
          styles.filterBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderSubtle,
            paddingVertical: spacing.xs + 2,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.page,
            gap: 8,
          }}
        >
          <Chip
            label="Newest"
            selected={sort === 'newest'}
            onPress={() => setSort('newest')}
          />
          <Chip
            label="Price: Low to High"
            selected={sort === 'price-low'}
            onPress={() => setSort('price-low')}
          />
          <Chip
            label="Price: High to Low"
            selected={sort === 'price-high'}
            onPress={() => setSort('price-high')}
          />
        </ScrollView>
      </View>

      <ProductGrid
        products={products}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onRetry={fetchCategoryProducts}
        emptyTitle={`No ${dynamicTitle} Items`}
        emptyDescription="Check back soon for new handcrafted arrivals in this collection."
        contentContainerStyle={{
          paddingHorizontal: spacing.page,
          paddingBottom: insets.bottom + spacing.xl,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
