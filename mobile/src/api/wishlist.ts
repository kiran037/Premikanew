/**
 * Customer Server Wishlist API Endpoints
 */

import { apiClient } from './client';
import { Product } from './types';

export const customerWishlistApi = {
  getWishlist: async (token: string) => {
    const response = await apiClient.get<Product[] | { items: Product[] }>('/api/customer/wishlist', { token });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.items || [];
  },

  addItem: async (token: string, productId: string) => {
    const response = await apiClient.post<{ success: boolean }>('/api/customer/wishlist/items', { productId }, { token });
    return response.data;
  },

  removeItem: async (token: string, productId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/api/customer/wishlist/items/${productId}`, { token });
    return response.data;
  },

  toggleItem: async (token: string, productId: string) => {
    const response = await apiClient.post<{ inWishlist: boolean }>('/api/customer/wishlist/toggle', { productId }, { token });
    return response.data;
  },
};
