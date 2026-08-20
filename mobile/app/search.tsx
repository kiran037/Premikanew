/**
 * Premika 2.0 Real-Time Search & Discovery Screen
 * Fast search input with recent search history chips, debounced querying, and 2-column ProductGrid results.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, Clock, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { TextInput } from '@/components/ui/TextInput';
import { Chip } from '@/components/ui/Chip';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Product } from '@/api/types';
import { productsApi } from '@/api/products';
import { useDebounce } from '@/hooks/useDebounce';
import { useRecentStore } from '@/store/recent-store';
import { haptic } from '@/utils/haptics';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);

  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const recentSearches = useRecentStore((state) => state.recentSearches);
  const addRecentSearch = useRecentStore((state) => state.addRecentSearch);
  const clearRecentSearches = useRecentStore((state) => state.clearRecentSearches);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      setHasMore(false);
      setPage(1);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await productsApi.searchProducts(debouncedQuery, 1, 20);
        setResults(res.items || []);
        setPage(1);
        const totalPages = res.pagination?.totalPages || 1;
        setHasMore(1 < totalPages);
        addRecentSearch(debouncedQuery);
      } catch (err: any) {
        setError(err.message || 'Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, addRecentSearch]);

  const handleLoadMore = async () => {
    if (!debouncedQuery.trim() || isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await productsApi.searchProducts(debouncedQuery, nextPage, 20);
      if (res.items && res.items.length > 0) {
        setResults((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const fresh = res.items.filter((p) => !existingIds.has(p.id));
          return [...prev, ...fresh];
        });
        setPage(nextPage);
        const totalPages = res.pagination?.totalPages || nextPage;
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      if (__DEV__) console.warn('[SearchScreen] Failed to load more search results:', err.message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSelectRecent = (q: string) => {
    haptic.selection();
    setQuery(q);
  };

  const handleClearHistory = () => {
    haptic.light();
    clearRecentSearches();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Search Input */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderSubtle,
            paddingHorizontal: spacing.page,
            paddingVertical: spacing.xs + 2,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search kurtis, designer sets, silk, cotton..."
            autoFocus
            leftIcon={<Search size={18} color={colors.textSecondary} />}
            rightIcon={
              query ? (
                <Pressable
                  onPress={() => {
                    haptic.light();
                    setQuery('');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color={colors.textMuted} />
                </Pressable>
              ) : null
            }
          />
        </View>
      </View>

      {/* Query Empty State — Show Recent Searches */}
      {!query.trim() ? (
        <ScrollView
          contentContainerStyle={{ padding: spacing.page }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {recentSearches.length > 0 ? (
            <View>
              <View style={styles.recentHeader}>
                <View style={styles.recentTitle}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginLeft: spacing.xs }]}>
                    Recent Searches
                  </Text>
                </View>

                <Pressable
                  onPress={handleClearHistory}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Clear recent search history"
                >
                  <Trash2 size={16} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.recentChips}>
                {recentSearches.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    onPress={() => handleSelectRecent(q)}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={[styles.emptyPrompt, { marginTop: spacing.xl }]}>
              <Search size={36} color={colors.border} />
              <Text style={[typography.bodyMedium, { color: colors.textTertiary, marginTop: spacing.sm, textAlign: 'center' }]}>
                Search our handcrafted collections, silhouettes, and seasonal arrivals.
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        /* Results Grid */
        <ProductGrid
          products={results}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          error={error}
          onEndReached={handleLoadMore}
          emptyTitle="No Results Found"
          emptyDescription={`We couldn't find any products matching "${query}".`}
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing.xl,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
