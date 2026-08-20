/**
 * Categories API Endpoint Module
 * Interacts with backend /api/categories endpoints
 */

import { apiClient } from './client';
import { Category } from './types';

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiClient.get<any>('/api/categories');
      const raw = (res as any)?.categories || (res as any)?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(raw) ? raw : [];
    } catch (error) {
      if (__DEV__) console.error('[getCategories Error]', error);
      return [];
    }
  },

  getCategoryBySlug: async (slug: string): Promise<Category | null> => {
    try {
      const res = await apiClient.get<any>(`/api/categories/${slug}`);
      return (res as any)?.data || (res as any)?.category || res || null;
    } catch (error) {
      if (__DEV__) console.error('[getCategoryBySlug Error]', error);
      return null;
    }
  },
};
