import { Request, Response, NextFunction } from "express";
import { AdminAuthService, ADMIN_COOKIE_NAME, AdminSessionPayload } from "@/services/admin-auth.service";
import { sendError } from "@/utils/api-response";

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return sendError(res, "Unauthenticated admin request", undefined, 401);
  }

  const session = AdminAuthService.verifySessionToken(token);

  if (!session) {
    return sendError(res, "Invalid or expired admin session token", undefined, 401);
  }

  req.admin = session;
  return next();
}

export function requireRole(...allowedRoles: Array<AdminSessionPayload["role"]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return sendError(res, "Unauthenticated admin request", undefined, 401);
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return sendError(res, "Insufficient permissions for this operation", undefined, 403);
    }

    return next();
  };
}
