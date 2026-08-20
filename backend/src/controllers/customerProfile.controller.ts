import { Request, Response } from "express";
import {
  CustomerProfileService,
  updateProfileSchema,
} from "@/services/customerProfile.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class CustomerProfileController {
  /**
   * GET /api/customer/profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const profile = await CustomerProfileService.getProfile(req.customer.id);
      return sendSuccess(res, { profile }, "Profile retrieved successfully");
    } catch (error: any) {
      return sendError(
        res,
        error.message || "Failed to retrieve profile",
        undefined,
        400
      );
    }
  }

  /**
   * PUT/PATCH /api/customer/profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const validation = updateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return sendError(
          res,
          firstIssue
            ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
            : "Invalid profile data",
          undefined,
          400
        );
      }

      const updated = await CustomerProfileService.updateProfile(
        req.customer.id,
        validation.data
      );

      return sendSuccess(
        res,
        { profile: updated },
        "Profile updated successfully"
      );
    } catch (error: any) {
      return sendError(
        res,
        error.message || "Failed to update profile",
        undefined,
        400
      );
    }
  }
}
