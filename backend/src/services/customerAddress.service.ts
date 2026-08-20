import { db } from "@/db/client";
import { customerAddresses } from "@/db/schema/customer";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const addressSchema = z.object({
  type: z.enum(["home", "office", "other"]).default("home"),
  fullName: z.string().min(1, "Full name is required").max(150),
  phone: z.string().min(1, "Phone number is required").max(20),
  addressLine1: z.string().min(1, "Address Line 1 is required").max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  landmark: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().max(100).default("India"),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.partial();

export type AddressInput = z.infer<typeof addressSchema>;

export class CustomerAddressService {
  /**
   * List all addresses for an authenticated customer
   */
  static async getAddresses(customerId: string) {
    return await db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customerId))
      .orderBy(desc(customerAddresses.isDefault), desc(customerAddresses.createdAt));
  }

  /**
   * Get single address by ID scoped strictly to customer ID
   */
  static async getAddressById(customerId: string, addressId: string) {
    const address = await db
      .select()
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, addressId),
          eq(customerAddresses.customerId, customerId)
        )
      )
      .then((rows) => rows[0] || null);

    if (!address) {
      throw new Error("Address not found or unauthorized");
    }

    return address;
  }

  /**
   * Create new address for customer
   */
  static async createAddress(customerId: string, input: AddressInput) {
    // If setting as default or if this is the first address, unset previous defaults
    const existingCount = await db
      .select({ id: customerAddresses.id })
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customerId));

    const isDefault = input.isDefault || existingCount.length === 0;

    if (isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customerId));
    }

    const [newAddress] = await db
      .insert(customerAddresses)
      .values({
        customerId,
        type: input.type,
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        addressLine1: input.addressLine1.trim(),
        addressLine2: input.addressLine2 ? input.addressLine2.trim() : null,
        landmark: input.landmark ? input.landmark.trim() : null,
        city: input.city.trim(),
        state: input.state.trim(),
        country: input.country ? input.country.trim() : "India",
        postalCode: input.postalCode.trim(),
        isDefault,
      })
      .returning();

    return newAddress;
  }

  /**
   * Update existing address scoped strictly to customer ID
   */
  static async updateAddress(
    customerId: string,
    addressId: string,
    input: Partial<AddressInput>
  ) {
    // Ensure ownership
    await this.getAddressById(customerId, addressId);

    if (input.isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customerId));
    }

    const payload: Partial<typeof customerAddresses.$inferInsert> = {};
    if (input.type !== undefined) payload.type = input.type;
    if (input.fullName !== undefined) payload.fullName = input.fullName.trim();
    if (input.phone !== undefined) payload.phone = input.phone.trim();
    if (input.addressLine1 !== undefined) payload.addressLine1 = input.addressLine1.trim();
    if (input.addressLine2 !== undefined) payload.addressLine2 = input.addressLine2 ? input.addressLine2.trim() : null;
    if (input.landmark !== undefined) payload.landmark = input.landmark ? input.landmark.trim() : null;
    if (input.city !== undefined) payload.city = input.city.trim();
    if (input.state !== undefined) payload.state = input.state.trim();
    if (input.country !== undefined) payload.country = input.country ? input.country.trim() : "India";
    if (input.postalCode !== undefined) payload.postalCode = input.postalCode.trim();
    if (input.isDefault !== undefined) payload.isDefault = input.isDefault;

    const [updated] = await db
      .update(customerAddresses)
      .set(payload)
      .where(
        and(
          eq(customerAddresses.id, addressId),
          eq(customerAddresses.customerId, customerId)
        )
      )
      .returning();

    return updated;
  }

  /**
   * Delete address scoped strictly to customer ID
   */
  static async deleteAddress(customerId: string, addressId: string) {
    const existing = await this.getAddressById(customerId, addressId);

    await db
      .delete(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, addressId),
          eq(customerAddresses.customerId, customerId)
        )
      );

    // If deleted address was default, make the most recent remaining address default
    if (existing.isDefault) {
      const remaining = await db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customerId))
        .orderBy(desc(customerAddresses.createdAt))
        .limit(1);

      if (remaining.length > 0) {
        await db
          .update(customerAddresses)
          .set({ isDefault: true })
          .where(eq(customerAddresses.id, remaining[0].id));
      }
    }

    return true;
  }

  /**
   * Set address as default for customer
   */
  static async setDefaultAddress(customerId: string, addressId: string) {
    await this.getAddressById(customerId, addressId);

    await db
      .update(customerAddresses)
      .set({ isDefault: false })
      .where(eq(customerAddresses.customerId, customerId));

    const [updated] = await db
      .update(customerAddresses)
      .set({ isDefault: true })
      .where(
        and(
          eq(customerAddresses.id, addressId),
          eq(customerAddresses.customerId, customerId)
        )
      )
      .returning();

    return updated;
  }
}
