/**
 * Persistent Wishlist Store supporting Guest local storage & Server sync on Customer Auth
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/api/types';
import { customerWishlistApi } from '@/api/wishlist';

export interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product, token?: string | null) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  mergeWithServer: (token: string) => Promise<void>;
  fetchServerWishlist: (token: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: async (product, token) => {
        const exists = get().items.some((item) => item.id === product.id);

        set((state) => {
          if (exists) {
            return { items: state.items.filter((item) => item.id !== product.id) };
          }
          return { items: [...state.items, product] };
        });

        if (token) {
          try {
            await customerWishlistApi.toggleItem(token, product.id);
          } catch (err) {
            console.warn('Server wishlist toggle failed:', err);
          }
        }
      },

      isWishlisted: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => set({ items: [] }),

      mergeWithServer: async (token: string) => {
        const localItems = get().items;
        try {
          if (localItems.length > 0) {
            for (const item of localItems) {
              await customerWishlistApi.addItem(token, item.id);
            }
          }
          await get().fetchServerWishlist(token);
        } catch (err) {
          console.warn('Wishlist merge with server failed:', err);
        }
      },

      fetchServerWishlist: async (token: string) => {
        try {
          const items = await customerWishlistApi.getWishlist(token);
          set({ items });
        } catch (err) {
          console.warn('Fetch server wishlist failed:', err);
        }
      },
    }),
    {
      name: 'premika-guest-wishlist',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
