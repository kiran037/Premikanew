/**
 * Application Environment Configuration
 * Centralized strongly-typed access to process.env variables
 */

import Constants from 'expo-constants';

function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

  // If a live HTTPS or non-localhost URL is configured, use it directly
  if (!envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // In local development on Expo Go (physical device or emulator), replace localhost with host machine IP
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.developer?.tool;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return envUrl.replace(/localhost|127\.0\.0\.1/g, hostIp);
      }
    }
  }

  return envUrl;
}

export const ENV = {
  API_URL: resolveApiUrl(),
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  IS_DEV: __DEV__,
};

export type Environment = typeof ENV;
