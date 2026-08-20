/**
 * Customer Address Book API Endpoints
 */

import { apiClient } from './client';
import { CustomerAddress } from './types';

export const addressesApi = {
  getAddresses: async (token: string) => {
    const response = await apiClient.get<CustomerAddress[]>('/api/customer/addresses', { token });
    return response.data;
  },

  getAddressById: async (token: string, id: string) => {
    const response = await apiClient.get<CustomerAddress>(`/api/customer/addresses/${id}`, { token });
    return response.data;
  },

  createAddress: async (token: string, address: Omit<CustomerAddress, 'id'>) => {
    const response = await apiClient.post<CustomerAddress>('/api/customer/addresses', address, { token });
    return response.data;
  },

  updateAddress: async (token: string, id: string, address: Partial<CustomerAddress>) => {
    const response = await apiClient.put<CustomerAddress>(`/api/customer/addresses/${id}`, address, { token });
    return response.data;
  },

  deleteAddress: async (token: string, id: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/api/customer/addresses/${id}`, { token });
    return response.data;
  },

  setDefaultAddress: async (token: string, id: string) => {
    const response = await apiClient.post<CustomerAddress>(`/api/customer/addresses/${id}/default`, {}, { token });
    return response.data;
  },
};
