/**
 * Centralized Premika HTTP API Client
 * Supports base URL configuration, timeouts, token injection, and structured error handling
 */

import { ENV } from '@/config/env';

export class ApiClientError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  token?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

const DEFAULT_TIMEOUT = 15000;

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    body,
    params,
    timeoutMs = DEFAULT_TIMEOUT,
    token,
    headers: customHeaders,
    ...customOptions
  } = options;

  const cleanBase = ENV.API_URL.replace(/\/+$/, '');
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanBase.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }

  let fullUrl = `${cleanBase}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (__DEV__) {
    console.log(`[API REQUEST] ${customOptions.method || 'GET'} ${fullUrl}`);
  }

  try {
    const response = await fetch(fullUrl, {
      ...customOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data: any = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (__DEV__) {
      console.log(`[API RESPONSE] ${response.status} ${fullUrl}`);
    }

    if (!response.ok) {
      const errorMessage =
        data && typeof data === 'object' && data.message
          ? data.message
          : `HTTP ${response.status}: ${response.statusText}`;
      if (__DEV__) {
        console.error(`[API ERROR] ${response.status} ${fullUrl}:`, errorMessage);
      }
      throw new ApiClientError(errorMessage, response.status, data);
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (__DEV__) {
      console.error(`[API ERROR] ${fullUrl}:`, error.message);
    }

    if (error.name === 'AbortError') {
      throw new ApiClientError(`Request timeout after ${timeoutMs}ms`, 408);
    }

    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(error.message || 'Network request failed', 0);
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
