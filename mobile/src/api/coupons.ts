/**
 * Coupons Validation API Module
 */

import { apiClient } from './client';
import { CouponValidationResult } from './types';

export const couponsApi = {
  validateCoupon: async (code: string, cartTotal: number): Promise<CouponValidationResult> => {
    try {
      const res = await apiClient.post<CouponValidationResult>('/api/coupons/validate', {
        code,
        cartTotal,
      });
      return res.data;
    } catch (error: any) {
      return {
        valid: false,
        message: error.message || 'Invalid coupon code',
      };
    }
  },
};
