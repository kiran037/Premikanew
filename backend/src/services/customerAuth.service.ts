import { getSupabaseClient } from "@/utils/supabaseClient";
import { CustomerAuthRepository, SupabaseIdentityInput } from "@/repositories/customerAuth.repository";
import { CustomerPayload } from "@/types/express";
import crypto from "crypto";

export class CustomerAuthService {
  /**
   * Helper to format a raw database customer record into clean CustomerPayload
   */
  static formatCustomerPayload(cust: any): CustomerPayload {
    return {
      id: cust.id,
      email: cust.email,
      phone: cust.phone || null,
      firstName: cust.firstName,
      lastName: cust.lastName || null,
      avatar: cust.avatar || null,
      isEmailVerified: cust.isEmailVerified,
      isPhoneVerified: cust.isPhoneVerified,
    };
  }

  /**
   * Decode base64url payload from JWT
   */
  private static decodeJwtPayload(token: string): any {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decoded = Buffer.from(payloadBase64, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Verify HMAC SHA-256 JWT signature using SUPABASE_JWT_SECRET if present
   */
  private static verifyHmacSignature(token: string, secret: string): boolean {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const signatureInput = `${parts[0]}.${parts[1]}`;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(signatureInput)
        .digest("base64url");
      
      const sigBuf = Buffer.from(parts[2]);
      const expBuf = Buffer.from(expectedSignature);
      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  /**
   * Verify Supabase JWT token and resolve/sync customer identity
   */
  static async verifyAndSyncCustomerToken(token: string) {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new Error("Missing authentication token");
    }

    const cleanToken = token.trim();
    let supabaseUser: any = null;

    // Method 1: Use Supabase JS SDK if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getUser(cleanToken);
        if (!error && data?.user) {
          supabaseUser = data.user;
        }
      } catch (err) {
        // Fallback to local JWT claim parsing if network/Supabase call fails
      }
    }

    // Method 2: Offline / fallback JWT claims validation
    if (!supabaseUser) {
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;
      const payload = this.decodeJwtPayload(cleanToken);

      if (!payload || typeof payload !== "object") {
        throw new Error("Invalid or malformed authentication token");
      }

      // Check token expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new Error("Authentication token has expired");
      }

      // If secret is set, verify HMAC signature
      if (jwtSecret && !this.verifyHmacSignature(cleanToken, jwtSecret)) {
        throw new Error("Invalid authentication token signature");
      }

      // Require valid subject claim ('sub') or email/phone
      if (!payload.sub && !payload.email && !payload.phone) {
        throw new Error("Token payload missing identity claims");
      }

      supabaseUser = {
        id: payload.sub || `sub_${Date.now()}`,
        email: payload.email || null,
        phone: payload.phone || null,
        email_confirmed_at: payload.email_confirmed_at || payload.email_verified ? new Date().toISOString() : null,
        phone_confirmed_at: payload.phone_confirmed_at || payload.phone_verified ? new Date().toISOString() : null,
        user_metadata: payload.user_metadata || payload.metadata || {},
      };
    }

    // Extract metadata name & avatar
    const meta = supabaseUser.user_metadata || {};
    const fullName = meta.full_name || meta.name || "";
    const nameParts = fullName.trim().split(" ");

    const firstName = meta.first_name || nameParts[0] || undefined;
    const lastName = meta.last_name || nameParts.slice(1).join(" ") || undefined;
    const avatar = meta.avatar_url || meta.picture || undefined;

    const identityInput: SupabaseIdentityInput = {
      sub: supabaseUser.id,
      email: supabaseUser.email || null,
      phone: supabaseUser.phone || null,
      emailVerified: !!supabaseUser.email_confirmed_at,
      phoneVerified: !!supabaseUser.phone_confirmed_at,
      firstName,
      lastName,
      avatar,
    };

    // Resolve & link identity against PostgreSQL database
    const dbCustomer = await CustomerAuthRepository.resolveIdentity(identityInput);
    if (!dbCustomer) {
      throw new Error("Failed to resolve customer record");
    }

    if (!dbCustomer.isActive) {
      throw new Error("Customer account has been deactivated");
    }

    return {
      customerRecord: dbCustomer,
      customerPayload: this.formatCustomerPayload(dbCustomer),
    };
  }
}
