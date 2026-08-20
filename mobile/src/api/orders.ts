/**
 * Customer Order History, Creation, Razorpay Payment & Tracking API Endpoints
 */

import { apiClient } from './client';
import { CustomerOrder, PaginatedProductsResponse } from './types';

export const ordersApi = {
  getOrders: async (token: string, page = 1, limit = 10) => {
    const response = await apiClient.get<CustomerOrder[] | { items: CustomerOrder[]; pagination: any }>(
      '/api/customer/orders',
      { token, params: { page, limit } }
    );
    if (Array.isArray(response.data)) {
      return { items: response.data, pagination: { page: 1, limit: 10, total: response.data.length, totalPages: 1 } };
    }
    return response.data;
  },

  getOrderByNumber: async (token: string, orderNumber: string) => {
    const response = await apiClient.get<CustomerOrder>(`/api/customer/orders/${orderNumber}`, { token });
    return response.data;
  },

  createOrder: async (
    orderData: {
      customer: {
        fullName: string;
        email?: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country?: string;
      };
      items: Array<{
        productId: string;
        title?: string;
        price: number;
        quantity: number;
        size?: string;
        height?: string;
      }>;
      couponCode?: string;
      paymentMethod?: string;
    },
    token?: string | null
  ) => {
    const response = await apiClient.post<{ orderNumber?: string; id?: string; order?: CustomerOrder }>(
      '/api/orders',
      orderData,
      token ? { token } : {}
    );
    return response.data;
  },

  createPaymentOrder: async (checkoutInput: any, token?: string | null) => {
    const response = await apiClient.post<{
      id: string;
      amount: number;
      currency: string;
      key?: string;
      orderNumber?: string;
      orderId?: string;
      customer?: any;
    }>('/api/createOrder', checkoutInput, token ? { token } : {});
    return response.data;
  },

  verifyPaymentOrder: async (verificationPayload: any, token?: string | null) => {
    const response = await apiClient.post<{ isOk: boolean; orderId?: string; message?: string }>(
      '/api/verifyOrder',
      verificationPayload,
      token ? { token } : {}
    );
    return response.data;
  },
};
