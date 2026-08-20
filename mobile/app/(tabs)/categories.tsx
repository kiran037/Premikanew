/**
 * Premika 2.0 Categories Discovery Screen
 * Dedicated 2-column visual grid of product categories with smooth virtualization.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBar } from '@/components/common/HeaderBar';
import { CategoryCard } from '@/components/category/CategoryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTheme } from '@/hooks/useTheme';
import { Category } from '@/api/types';
import { categoriesApi } from '@/api/categories';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setError(null);
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCategories();
  };

  const renderItem: ListRenderItem<Category> = ({ item }) => (
    <View style={styles.gridItem}>
      <CategoryCard category={item} variant="grid" height={164} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar
        title="Categories"
        showBack={false}
        showMenu={true}
        showSearch={true}
        showWishlist={false}
        showCart={true}
      />

      {error && !isLoading ? (
        <View style={{ padding: spacing.page }}>
          <ErrorState message={error} onRetry={fetchCategories} />
        </View>
      ) : isLoading && categories.length === 0 ? (
        <View style={[styles.grid, { padding: spacing.page, gap: spacing.gridGutter }]}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <View key={key} style={styles.gridItem}>
              <Skeleton height={164} borderRadius={radius.card} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          columnWrapperStyle={[styles.columnWrapper, { gap: spacing.gridGutter }]}
          contentContainerStyle={[
            styles.content,
            {
              padding: spacing.page,
              paddingBottom: spacing.bottomBarHeight + insets.bottom + 24,
            },
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    maxWidth: '48.5%',
  },
});
