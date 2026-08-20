/**
 * Persistent Recently Viewed Products & Recent Search Queries Store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/api/types';

export interface RecentState {
  recentlyViewed: Product[];
  recentSearches: string[];
  addRecentlyViewed: (product: Product) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      recentSearches: [],

      addRecentlyViewed: (product) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter((item) => item.id !== product.id);
          return {
            recentlyViewed: [product, ...filtered].slice(0, 10), // Limit to top 10 items
          };
        });
      },

      addRecentSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => {
          const filtered = state.recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
          return {
            recentSearches: [trimmed, ...filtered].slice(0, 5), // Limit to top 5 recent searches
          };
        });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'premika-recent-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
