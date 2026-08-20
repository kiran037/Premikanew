import { Request, Response, NextFunction } from "express";
import { CustomerAuthService } from "@/services/customerAuth.service";
import { sendError } from "@/utils/api-response";

export async function customerAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        "Authentication required. Missing Bearer token in Authorization header.",
        undefined,
        401
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return sendError(
        res,
        "Authentication required. Empty Bearer token.",
        undefined,
        401
      );
    }

    const { customerPayload } =
      await CustomerAuthService.verifyAndSyncCustomerToken(token);

    req.customer = customerPayload;
    return next();
  } catch (error: any) {
    return sendError(
      res,
      error.message || "Invalid or expired customer authentication token.",
      undefined,
      401
    );
  }
}
