import { db } from "@/db/client";
import { customers } from "@/db/schema/customer";
import { eq, or, ilike } from "drizzle-orm";

export interface SupabaseIdentityInput {
  sub: string;
  email?: string | null;
  phone?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

export class CustomerAuthRepository {
  /**
   * Find customer record by exact phone number
   */
  static async findByPhone(phone: string) {
    if (!phone || !phone.trim()) return null;
    const cleanPhone = phone.trim();
    return await db
      .select()
      .from(customers)
      .where(eq(customers.phone, cleanPhone))
      .then((rows) => rows[0] || null);
  }

  /**
   * Find customer record by email (case-insensitive)
   */
  static async findByEmail(email: string) {
    if (!email || !email.trim()) return null;
    const cleanEmail = email.toLowerCase().trim();
    return await db
      .select()
      .from(customers)
      .where(eq(customers.email, cleanEmail))
      .then((rows) => rows[0] || null);
  }

  /**
   * Find customer by primary key UUID
   */
  static async findById(id: string) {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .then((rows) => rows[0] || null);
  }

  /**
   * Safely update customer last login timestamp & optional profile fields
   */
  static async touchCustomerLogin(
    id: string,
    updates?: {
      phone?: string | null;
      avatar?: string | null;
      isEmailVerified?: boolean;
      isPhoneVerified?: boolean;
    }
  ) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const payload: Partial<typeof customers.$inferInsert> = {
      lastLoginAt: new Date(),
    };

    if (!existing.phone && updates?.phone && updates.phone.trim()) {
      // Ensure phone is not taken by another user before setting
      const phoneTaken = await this.findByPhone(updates.phone.trim());
      if (!phoneTaken) {
        payload.phone = updates.phone.trim();
      }
    }

    if (!existing.avatar && updates?.avatar) {
      payload.avatar = updates.avatar;
    }

    if (updates?.isEmailVerified && !existing.isEmailVerified) {
      payload.isEmailVerified = true;
    }

    if (updates?.isPhoneVerified && !existing.isPhoneVerified) {
      payload.isPhoneVerified = true;
    }

    const [updated] = await db
      .update(customers)
      .set(payload)
      .where(eq(customers.id, id))
      .returning();

    return updated || existing;
  }

  /**
   * Resolve customer identity based on verified Supabase JWT input
   */
  static async resolveIdentity(input: SupabaseIdentityInput) {
    const cleanPhone = input.phone ? input.phone.trim() : null;
    const cleanEmail = input.email ? input.email.toLowerCase().trim() : null;

    // Rule 1: Match by verified phone number if present
    if (cleanPhone) {
      const matchByPhone = await this.findByPhone(cleanPhone);
      if (matchByPhone) {
        return await this.touchCustomerLogin(matchByPhone.id, {
          avatar: input.avatar,
          isPhoneVerified: input.phoneVerified,
          isEmailVerified: input.emailVerified,
        });
      }
    }

    // Rule 2: Match by verified email if present
    if (cleanEmail) {
      const matchByEmail = await this.findByEmail(cleanEmail);
      if (matchByEmail) {
        return await this.touchCustomerLogin(matchByEmail.id, {
          phone: cleanPhone,
          avatar: input.avatar,
          isEmailVerified: input.emailVerified,
          isPhoneVerified: input.phoneVerified,
        });
      }
    }

    // Rule 3: Create new customer row if no matching identity exists
    let finalEmail = cleanEmail;
    if (!finalEmail) {
      // If user registered with Phone OTP without email, generate safe placeholder email
      const phoneDigits = cleanPhone ? cleanPhone.replace(/\D/g, "") : Date.now().toString();
      finalEmail = `phone_${phoneDigits}@customer.premika.com`;
      
      // Ensure generated placeholder email doesn't collide
      const existingPlaceholder = await this.findByEmail(finalEmail);
      if (existingPlaceholder) {
        finalEmail = `phone_${phoneDigits}_${Math.floor(Math.random() * 10000)}@customer.premika.com`;
      }
    }

    const firstName = input.firstName || (cleanEmail ? cleanEmail.split("@")[0] : "Customer");
    const lastName = input.lastName || null;

    const [newCustomer] = await db
      .insert(customers)
      .values({
        firstName,
        lastName,
        email: finalEmail,
        phone: cleanPhone,
        avatar: input.avatar || null,
        isEmailVerified: input.emailVerified ?? false,
        isPhoneVerified: input.phoneVerified ?? false,
        isActive: true,
        lastLoginAt: new Date(),
      })
      .returning();

    return newCustomer;
  }
}
