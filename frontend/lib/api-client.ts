/**
 * Premika Standalone API Client Helper
 * Routes all API communication to the standalone Node.js Express backend.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

/**
 * Returns full URL for a given API path
 * Example: getApiUrl("/api/products") -> "http://localhost:5001/api/products"
 */
export function getApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Centralized fetch wrapper for communicating with Node.js backend
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(endpoint);

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Set JSON Content-Type default if body is present and not FormData
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const timeoutMs = 15000; // 15s request timeout safety
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const callerSignal = options.signal;
  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort();
    } else {
      callerSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials || "include", // Required for admin session cookie sending/receiving
    signal: controller.signal,
  };

  try {
    return await fetch(url, fetchOptions);
  } finally {
    clearTimeout(timeoutId);
  }
}
