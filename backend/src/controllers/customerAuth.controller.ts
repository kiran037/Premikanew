import { Request, Response } from "express";
import { CustomerAuthService } from "@/services/customerAuth.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class CustomerAuthController {
  /**
   * POST /api/customer/auth/sync
   * Accepts Supabase access token in Authorization Bearer header,
   * verifies JWT, resolves/creates customer in PostgreSQL, returns customer profile.
   */
  static async syncAuth(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const bodyToken = req.body?.accessToken || req.body?.token;
      let token = bodyToken;

      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }

      if (!token) {
        return sendError(
          res,
          "Missing authentication token in request.",
          undefined,
          400
        );
      }

      const { customerPayload } =
        await CustomerAuthService.verifyAndSyncCustomerToken(token);

      return sendSuccess(
        res,
        { customer: customerPayload },
        "Customer authenticated and synchronized successfully",
        200
      );
    } catch (error: any) {
      return sendError(
        res,
        error.message || "Failed to authenticate customer",
        undefined,
        401
      );
    }
  }

  /**
   * GET /api/customer/auth/me
   * Returns currently authenticated customer object.
   */
  static async getMe(req: Request, res: Response) {
    if (!req.customer) {
      return sendError(res, "Unauthenticated customer request", undefined, 401);
    }

    return sendSuccess(
      res,
      { customer: req.customer },
      "Current customer profile retrieved"
    );
  }
}
