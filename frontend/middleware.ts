import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session_token";

/**
 * Verify HMAC SHA-256 token signature using Edge-compatible Web Crypto API with constant-time comparison
 */
async function verifyTokenSignature(dataStr: string, signature: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(dataStr)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signature.length !== expectedSignature.length) return false;

    let diff = 0;
    for (let i = 0; i < signature.length; i++) {
      diff |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Verify Admin Session Authentication
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token && token.includes(".")) {
    try {
      const [dataStr, signature] = token.split(".");

      if (dataStr && signature) {
        const isValidSignature = await verifyTokenSignature(dataStr, signature);

        if (isValidSignature) {
          const decodedJson = atob(dataStr.replace(/-/g, "+").replace(/_/g, "/"));
          const payload = JSON.parse(decodedJson);

          if (payload && payload.expiresAt && Date.now() < payload.expiresAt) {
            isAuthenticated = true;
          }
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 2. Admin Panel Authentication Guard
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    // Unauthenticated admin -> Redirect to login
    if (!isAuthenticated && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated admin visiting login -> Redirect to dashboard
    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Allow admin APIs and maintenance status API to pass through
  if (pathname.startsWith("/api/admin") || pathname === "/api/maintenance") {
    return NextResponse.next();
  }

  // 3. Maintenance Mode Guard for Public Storefront
  // Bypass maintenance checks for authenticated admins
  if (isAuthenticated) {
    return NextResponse.next();
  }

  // Exempt routes & static assets from maintenance redirect
  const isExemptRoute =
    pathname === "/maintenance" ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logo.png") ||
    /\.(png|jpg|jpeg|webp|svg|gif|ico|css|js|woff|woff2|ttf)$/i.test(pathname);

  if (isExemptRoute) {
    return NextResponse.next();
  }

  // Check process.env override first
  if (process.env.MAINTENANCE_MODE === "true") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // In-memory Edge cache for maintenance status to eliminate per-request HTTP waterfall
  const now = Date.now();
  if (maintenanceCache && now < maintenanceCache.expiresAt) {
    if (maintenanceCache.isMaintenance) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
    return NextResponse.next();
  }

  // Fetch Maintenance Mode status via HTTP route handler with short timeout and cache for 30s
  try {
    const maintUrl = new URL("/api/maintenance", request.url);
    const res = await fetch(maintUrl, {
      headers: { "x-middleware-request": "1" },
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      const isMaint = !!data?.maintenanceMode;
      maintenanceCache = { isMaintenance: isMaint, expiresAt: now + 30000 };
      if (isMaint) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  } catch (err) {
    // On fetch error or timeout, assume not in maintenance and cache for 10s
    maintenanceCache = { isMaintenance: false, expiresAt: now + 10000 };
  }

  return NextResponse.next();
}

let maintenanceCache: { isMaintenance: boolean; expiresAt: number } | null = null;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
