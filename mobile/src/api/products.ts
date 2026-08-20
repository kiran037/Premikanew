/**
 * Products API Endpoint Module
 * Interacts with backend /api/products endpoints
 */

import { apiClient } from './client';
import { Product, GetProductsParams, PaginatedProductsResponse } from './types';

export const normalizeSortParam = (
  sort?: string
): 'featured' | 'price-low' | 'price-high' | 'name' | 'newest' | undefined => {
  if (!sort) return undefined;
  const s = sort.toLowerCase().trim();
  if (s === 'price_desc' || s === 'price-desc' || s === 'price-high') return 'price-high';
  if (s === 'price_asc' || s === 'price-asc' || s === 'price-low') return 'price-low';
  if (s === 'title_asc' || s === 'name_asc' || s === 'name') return 'name';
  if (s === 'newest') return 'newest';
  if (s === 'featured') return 'featured';
  return 'featured';
};

export const productsApi = {
  getProducts: async (params?: GetProductsParams): Promise<{ items: Product[]; pagination?: any }> => {
    const queryParams = params
      ? {
          ...params,
          ...(params.sort ? { sort: normalizeSortParam(params.sort) } : {}),
        }
      : undefined;
    const res = await apiClient.get<any>('/api/products', { params: queryParams as any });
    // Backend returns { success: true, products: [...], pagination: {...} } or { success: true, data: [...] }
    const rawItems = (res as any)?.products || (res as any)?.data || (Array.isArray(res) ? res : []);
    const items = Array.isArray(rawItems) ? rawItems : [];
    const pagination = (res as any)?.pagination || (res as any)?.data?.pagination;
    return { items, pagination };
  },

  getProductBySlug: async (slug: string): Promise<Product | null> => {
    try {
      const res = await apiClient.get<any>(`/api/products/${slug}`);
      return (res as any)?.data || (res as any)?.product || res || null;
    } catch (error) {
      if (__DEV__) console.error('[getProductBySlug Error]', error);
      return null;
    }
  },

  getFeaturedProducts: async (limit = 6): Promise<Product[]> => {
    try {
      const res = await productsApi.getProducts({ featured: true, limit });
      return res.items;
    } catch (error) {
      if (__DEV__) console.error('[getFeaturedProducts Error]', error);
      return [];
    }
  },

  getNewArrivals: async (limit = 6): Promise<Product[]> => {
    try {
      const res = await productsApi.getProducts({ newArrival: true, limit });
      return res.items;
    } catch (error) {
      if (__DEV__) console.error('[getNewArrivals Error]', error);
      return [];
    }
  },

  searchProducts: async (
    query: string,
    page = 1,
    limit = 20
  ): Promise<{ items: Product[]; pagination?: any }> => {
    if (!query.trim()) return { items: [] };
    try {
      const res = await productsApi.getProducts({ search: query, page, limit });
      return res;
    } catch (error) {
      if (__DEV__) console.error('[searchProducts Error]', error);
      return { items: [] };
    }
  },
};
