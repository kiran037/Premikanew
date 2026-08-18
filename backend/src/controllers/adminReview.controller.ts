import { Request, Response, NextFunction } from "express";
import { ReviewService } from "@/services/review.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class AdminReviewController {
  static async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;
      const rating = req.query.rating ? parseInt(req.query.rating as string, 10) : undefined;
      const isApproved = req.query.isApproved !== undefined ? req.query.isApproved === "true" : undefined;
      const sortBy = req.query.sortBy as any;

      const result = await ReviewService.getReviews({
        page,
        limit,
        search,
        rating,
        status: isApproved !== undefined ? (isApproved ? "approved" : "pending") : undefined,
        sortBy,
      });

      return sendSuccess(res, result.items, result.pagination);
    } catch (err) {
      return next(err);
    }
  }

  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ReviewService.updateReview(id, req.body);
      return sendSuccess(res, updated, "Review updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update review", undefined, 400);
    }
  }

  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ReviewService.deleteReview(id);
      return sendSuccess(res, null, "Review deleted successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to delete review", undefined, 400);
    }
  }
}
