/**
 * Premika 2.0 2-Column Product Grid Component
 * Performant FlatList with loading skeletons, refresh control, pagination & empty states.
 */

import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ListRenderItem, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import { Product } from '@/api/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTheme } from '@/hooks/useTheme';
import { ShoppingBag } from 'lucide-react-native';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onRetry?: () => void;
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  isLoadingMore = false,
  isRefreshing = false,
  error = null,
  onRefresh,
  onEndReached,
  onRetry,
  ListHeaderComponent,
  contentContainerStyle,
  emptyTitle = 'No Products Found',
  emptyDescription = 'Try adjusting your search query or filters.',
}) => {
  const { colors, spacing, radius } = useTheme();

  const renderItem: ListRenderItem<Product> = useCallback(({ item }) => (
    <View style={styles.itemWrapper}>
      <ProductCard product={item} />
    </View>
  ), []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors.primary]);

  if (isLoading && products.length === 0) {
    return (
      <View style={[styles.skeletonContainer, { padding: spacing.page }]}>
        {ListHeaderComponent}
        <View style={[styles.skeletonGrid, { gap: spacing.gridGutter }]}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <View key={key} style={styles.itemWrapper}>
              <Skeleton
                height={210}
                borderRadius={radius.productImage}
                style={{ marginBottom: 8 }}
              />
              <Skeleton
                height={14}
                width="80%"
                borderRadius={radius.xs}
                style={{ marginBottom: 4 }}
              />
              <Skeleton height={18} width="40%" borderRadius={radius.xs} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        {ListHeaderComponent}
        <ErrorState message={error} onRetry={onRetry} />
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      windowSize={5}
      columnWrapperStyle={[styles.columnWrapper, { gap: spacing.gridGutter }]}
      contentContainerStyle={[
        styles.contentContainer,
        { padding: spacing.page },
        contentContainerStyle,
      ]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={<ShoppingBag size={44} color={colors.primary} />}
          actionTitle="Explore Store"
          onAction={onRefresh}
        />
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  itemWrapper: {
    flex: 1,
    maxWidth: '48.5%',
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
