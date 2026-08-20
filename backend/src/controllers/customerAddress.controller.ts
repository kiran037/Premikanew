import { Request, Response } from "express";
import {
  CustomerAddressService,
  addressSchema,
  updateAddressSchema,
} from "@/services/customerAddress.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class CustomerAddressController {
  /**
   * GET /api/customer/addresses
   */
  static async getAddresses(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const addresses = await CustomerAddressService.getAddresses(req.customer.id);
      return sendSuccess(res, { addresses }, "Addresses retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve addresses", undefined, 400);
    }
  }

  /**
   * GET /api/customer/addresses/:id
   */
  static async getAddressById(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const address = await CustomerAddressService.getAddressById(
        req.customer.id,
        req.params.id
      );
      return sendSuccess(res, { address }, "Address retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Address not found", undefined, 404);
    }
  }

  /**
   * POST /api/customer/addresses
   */
  static async createAddress(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const validation = addressSchema.safeParse(req.body);
      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return sendError(
          res,
          firstIssue
            ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
            : "Invalid address input",
          undefined,
          400
        );
      }

      const newAddress = await CustomerAddressService.createAddress(
        req.customer.id,
        validation.data
      );

      return sendSuccess(
        res,
        { address: newAddress },
        "Address created successfully",
        201
      );
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create address", undefined, 400);
    }
  }

  /**
   * PUT/PATCH /api/customer/addresses/:id
   */
  static async updateAddress(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const validation = updateAddressSchema.safeParse(req.body);
      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return sendError(
          res,
          firstIssue
            ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
            : "Invalid address input",
          undefined,
          400
        );
      }

      const updated = await CustomerAddressService.updateAddress(
        req.customer.id,
        req.params.id,
        validation.data
      );

      return sendSuccess(res, { address: updated }, "Address updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update address", undefined, 400);
    }
  }

  /**
   * DELETE /api/customer/addresses/:id
   */
  static async deleteAddress(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      await CustomerAddressService.deleteAddress(req.customer.id, req.params.id);
      return sendSuccess(res, { success: true }, "Address deleted successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to delete address", undefined, 400);
    }
  }

  /**
   * POST /api/customer/addresses/:id/default
   */
  static async setDefaultAddress(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const updated = await CustomerAddressService.setDefaultAddress(
        req.customer.id,
        req.params.id
      );

      return sendSuccess(res, { address: updated }, "Default address set successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to set default address", undefined, 400);
    }
  }
}
