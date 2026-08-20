/**
 * Customer Authentication Sync & Profile API Endpoints
 */

import { apiClient } from './client';
import { CustomerProfile } from './types';

export const customerApi = {
  /**
   * Sync Supabase authentication session with Premika Backend
   * Endpoint: POST /api/customer/auth/sync
   */
  syncAuth: async (token: string, metadata?: { phone?: string; fullName?: string; avatarUrl?: string }) => {
    const response = await apiClient.post<{ customer: CustomerProfile }>(
      '/api/customer/auth/sync',
      metadata,
      { token }
    );
    return response.data;
  },

  /**
   * Get Current Authenticated Customer Profile
   * Endpoint: GET /api/customer/auth/me
   */
  getMe: async (token: string) => {
    const response = await apiClient.get<CustomerProfile>('/api/customer/auth/me', { token });
    return response.data;
  },

  /**
   * Get Profile Details
   * Endpoint: GET /api/customer/profile
   */
  getProfile: async (token: string) => {
    const response = await apiClient.get<CustomerProfile>('/api/customer/profile', { token });
    return response.data;
  },

  /**
   * Update Profile Details (firstName, lastName, phone, avatarUrl)
   * Endpoint: PUT /api/customer/profile
   */
  updateProfile: async (
    token: string,
    updates: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }
  ) => {
    const response = await apiClient.put<CustomerProfile>('/api/customer/profile', updates, { token });
    return response.data;
  },
};
