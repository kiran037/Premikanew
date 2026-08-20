/**
 * Customer Server Cart Management API Endpoints
 */

import { apiClient } from './client';
import { ServerCartResponse, ServerCartItem } from './types';

export const customerCartApi = {
  getCart: async (token: string) => {
    const response = await apiClient.get<ServerCartResponse>('/api/customer/cart', { token });
    return response.data;
  },

  addItem: async (
    token: string,
    item: { productId: string; variantId?: string; quantity: number; selectedSize?: string; selectedHeight?: string }
  ) => {
    const response = await apiClient.post<ServerCartItem>('/api/customer/cart/items', item, { token });
    return response.data;
  },

  updateItemQuantity: async (token: string, id: string, quantity: number) => {
    const response = await apiClient.patch<ServerCartItem>(`/api/customer/cart/items/${id}`, { quantity }, { token });
    return response.data;
  },

  removeItem: async (token: string, id: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/api/customer/cart/items/${id}`, { token });
    return response.data;
  },

  clearCart: async (token: string) => {
    const response = await apiClient.delete<{ success: boolean }>('/api/customer/cart', { token });
    return response.data;
  },

  mergeCart: async (
    token: string,
    items: Array<{ productId: string; quantity: number; selectedSize?: string; selectedHeight?: string }>
  ) => {
    const response = await apiClient.post<ServerCartResponse>('/api/customer/cart/merge', { items }, { token });
    return response.data;
  },
};
