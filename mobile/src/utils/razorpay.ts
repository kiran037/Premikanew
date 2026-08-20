/**
 * Razorpay Native SDK & Translucent Checkout Helper
 * Safe integration with react-native-razorpay native module and fallback support
 */

import { NativeModules, Platform } from 'react-native';

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string; // backend-generated Razorpay order ID
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const isNativeRazorpayAvailable = (): boolean => {
  return !!NativeModules.RazorpayCheckout;
};

export const launchNativeRazorpay = async (
  options: RazorpayCheckoutOptions
): Promise<RazorpaySuccessResponse> => {
  if (__DEV__) {
    console.log('[RAZORPAY] Launching native checkout for order:', options.order_id);
  }
  const RazorpayCheckout = require('react-native-razorpay').default;
  return RazorpayCheckout.open(options);
};
