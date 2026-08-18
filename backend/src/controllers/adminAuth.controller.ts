import { Request, Response, NextFunction } from "express";
import { AdminAuthService, ADMIN_COOKIE_NAME } from "@/services/admin-auth.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class AdminAuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, rememberMe } = req.body || {};

      if (!email || !password) {
        return sendError(res, "Email and password are required", undefined, 400);
      }

      const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "127.0.0.1";
      const ipAddress = rawIp.trim();
      const userAgent = req.headers["user-agent"] || "unknown";

      const authResult = await AdminAuthService.authenticate({
        email,
        password,
        rememberMe: Boolean(rememberMe),
        ipAddress,
        userAgent,
      });

      // Set HTTP-only session cookie
      res.cookie(ADMIN_COOKIE_NAME, authResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: authResult.maxAge * 1000,
        path: "/",
      });

      return res.status(200).json({
        success: true,
        data: authResult.admin,
        token: authResult.token,
        message: "Login successful",
      });
    } catch (err: any) {
      console.error("Error in admin login controller:", err);
      return sendError(res, err.message || "Authentication failed", undefined, 401);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[ADMIN_COOKIE_NAME];
      let adminId: string | undefined = undefined;

      if (token) {
        const payload = AdminAuthService.verifySessionToken(token);
        if (payload) adminId = payload.adminId;
      }

      const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "unknown";

      await AdminAuthService.logoutAdmin(adminId, rawIp, userAgent);

      res.clearCookie(ADMIN_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return sendSuccess(res, null, "Logged out successfully");
    } catch (err) {
      return next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.admin) {
        return sendError(res, "Unauthenticated admin request", undefined, 401);
      }

      return sendSuccess(res, {
        adminId: req.admin.adminId,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
      });
    } catch (err) {
      return next(err);
    }
  }
}
