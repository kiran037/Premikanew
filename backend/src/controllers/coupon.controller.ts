import { Request, Response, NextFunction } from "express";
import { CouponService } from "@/services/coupon.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class CouponController {
  static async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body || {};

      if (!code || typeof subtotal !== "number") {
        return sendError(res, "Code and subtotal are required", undefined, 400);
      }

      const result = await CouponService.validateCoupon(code, subtotal);

      if (!result.valid) {
        return sendError(res, result.message || "Invalid coupon", undefined, 400);
      }

      return sendSuccess(res, result);
    } catch (err) {
      return next(err);
    }
  }
}
