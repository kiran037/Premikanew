import { db } from "@/db/client";
import { customers } from "@/db/schema/customer";
import { CustomerAuthRepository } from "@/repositories/customerAuth.repository";
import { CustomerAuthService } from "@/services/customerAuth.service";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100).optional(),
  lastName: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  avatar: z.string().url("Invalid avatar URL").optional().nullable().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export class CustomerProfileService {
  /**
   * Fetch current customer profile by ID
   */
  static async getProfile(customerId: string) {
    const cust = await CustomerAuthRepository.findById(customerId);
    if (!cust) {
      throw new Error("Customer profile not found");
    }
    return CustomerAuthService.formatCustomerPayload(cust);
  }

  /**
   * Update sanitized customer profile fields
   */
  static async updateProfile(customerId: string, input: UpdateProfileInput) {
    const existing = await CustomerAuthRepository.findById(customerId);
    if (!existing) {
      throw new Error("Customer profile not found");
    }

    const payload: Partial<typeof customers.$inferInsert> = {};

    if (input.firstName !== undefined) {
      payload.firstName = input.firstName.trim();
    }

    if (input.lastName !== undefined) {
      payload.lastName = input.lastName ? input.lastName.trim() : null;
    }

    if (input.avatar !== undefined) {
      payload.avatar = input.avatar ? input.avatar.trim() : null;
    }

    if (input.phone !== undefined) {
      const cleanPhone = input.phone ? input.phone.trim() : null;
      if (cleanPhone && cleanPhone !== existing.phone) {
        // Check if phone number is already registered to another customer
        const phoneOwner = await CustomerAuthRepository.findByPhone(cleanPhone);
        if (phoneOwner && phoneOwner.id !== customerId) {
          throw new Error("Phone number is already associated with another customer account.");
        }
        payload.phone = cleanPhone;
      } else if (!cleanPhone) {
        payload.phone = null;
      }
    }

    if (Object.keys(payload).length === 0) {
      return CustomerAuthService.formatCustomerPayload(existing);
    }

    const [updated] = await db
      .update(customers)
      .set(payload)
      .where(eq(customers.id, customerId))
      .returning();

    return CustomerAuthService.formatCustomerPayload(updated || existing);
  }
}
