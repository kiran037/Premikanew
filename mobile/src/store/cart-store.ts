/**
 * Persistent Cart Store supporting Guest local storage & Server sync on Customer Auth
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/api/types';
import { customerCartApi } from '@/api/cart';

export interface CartItem {
  id: string;
  product: Product;
  selectedSize?: string;
  selectedHeight?: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, selectedSize?: string, selectedHeight?: string, quantity?: number, token?: string | null) => Promise<void>;
  removeItem: (id: string, token?: string | null) => Promise<void>;
  updateQuantity: (id: string, quantity: number, token?: string | null) => Promise<void>;
  clearCart: (token?: string | null) => Promise<void>;
  mergeWithServer: (token: string) => Promise<void>;
  fetchServerCart: (token: string) => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (product, selectedSize, selectedHeight, quantity = 1, token) => {
        const itemId = `${product.id}-${selectedSize || 'default'}-${selectedHeight || 'default'}`;

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === itemId);

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated };
          }

          return {
            items: [
              ...state.items,
              {
                id: itemId,
                product,
                selectedSize,
                selectedHeight,
                quantity,
              },
            ],
          };
        });

        if (token) {
          try {
            await customerCartApi.addItem(token, {
              productId: product.id,
              quantity,
              selectedSize,
              selectedHeight,
            });
          } catch (err) {
            console.warn('Server cart addItem failed:', err);
          }
        }
      },

      removeItem: async (id, token) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));

        if (token) {
          try {
            await customerCartApi.removeItem(token, id);
          } catch (err) {
            console.warn('Server cart removeItem failed:', err);
          }
        }
      },

      updateQuantity: async (id, quantity, token) => {
        if (quantity <= 0) {
          await get().removeItem(id, token);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        }));

        if (token) {
          try {
            await customerCartApi.updateItemQuantity(token, id, quantity);
          } catch (err) {
            console.warn('Server cart updateQuantity failed:', err);
          }
        }
      },

      clearCart: async (token) => {
        set({ items: [] });
        if (token) {
          try {
            await customerCartApi.clearCart(token);
          } catch (err) {
            console.warn('Server cart clear failed:', err);
          }
        }
      },

      mergeWithServer: async (token: string) => {
        const localItems = get().items;
        try {
          if (localItems.length > 0) {
            await customerCartApi.mergeCart(
              token,
              localItems.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedHeight: item.selectedHeight,
              }))
            );
          }
          await get().fetchServerCart(token);
        } catch (err) {
          console.warn('Cart merge with server failed:', err);
        }
      },

      fetchServerCart: async (token: string) => {
        try {
          const res = await customerCartApi.getCart(token);
          if (res && Array.isArray(res.items)) {
            const mappedItems: CartItem[] = res.items
              .filter((item) => item.product)
              .map((item) => ({
                id: item.id || `${item.productId}-${item.selectedSize || 'default'}-${item.selectedHeight || 'default'}`,
                product: item.product!,
                selectedSize: item.selectedSize,
                selectedHeight: item.selectedHeight,
                quantity: item.quantity,
              }));
            set({ items: mappedItems });
          }
        } catch (err) {
          console.warn('Fetch server cart failed:', err);
        }
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
      },
    }),
    {
      name: 'premika-guest-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
