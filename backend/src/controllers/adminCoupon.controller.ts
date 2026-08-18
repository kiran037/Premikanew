import { Request, Response, NextFunction } from "express";
import { CouponService } from "@/services/coupon.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class AdminCouponController {
  static async getCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;
      const isActive = req.query.status !== undefined ? req.query.status === "active" || req.query.status === "true" : undefined;
      const type = req.query.type as any;
      const sortBy = req.query.sortBy as any;

      const result = await CouponService.getAdminCouponsList({
        page,
        limit,
        search,
        isActive,
        type,
        sortBy,
      });

      return sendSuccess(res, result.items, result.pagination);
    } catch (err) {
      return next(err);
    }
  }

  static async getCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await CouponService.getAdminCouponById(id);
      return sendSuccess(res, coupon);
    } catch (err: any) {
      return sendError(res, err.message || "Coupon not found", undefined, 404);
    }
  }

  static async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await CouponService.createAdminCoupon(req.body);
      return sendSuccess(res, created, "Coupon created successfully", 201);
    } catch (err: any) {
      return sendError(res, err.message || "Failed to create coupon", undefined, 400);
    }
  }

  static async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await CouponService.updateAdminCoupon(id, req.body);
      return sendSuccess(res, updated, "Coupon updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update coupon", undefined, 400);
    }
  }

  static async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CouponService.deleteAdminCoupon(id);
      return sendSuccess(res, null, "Coupon deleted successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to delete coupon", undefined, 400);
    }
  }

  static async duplicateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const duplicated = await CouponService.duplicateCoupon(id);
      return sendSuccess(res, duplicated, "Coupon duplicated successfully", 201);
    } catch (err: any) {
      return sendError(res, err.message || "Failed to duplicate coupon", undefined, 400);
    }
  }

  static async bulkAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, action, isActive } = req.body || {};

      if (!Array.isArray(ids) || ids.length === 0) {
        return sendError(res, "No coupons selected", undefined, 400);
      }

      if (action === "updateStatus") {
        await CouponService.bulkUpdateStatus(ids, Boolean(isActive));
        return sendSuccess(res, null, `Bulk status updated successfully`);
      } else if (action === "delete") {
        await CouponService.bulkDelete(ids);
        return sendSuccess(res, null, `Bulk delete completed successfully`);
      }

      return sendError(res, "Invalid bulk action", undefined, 400);
    } catch (err: any) {
      return sendError(res, err.message || "Bulk action failed", undefined, 400);
    }
  }
}
