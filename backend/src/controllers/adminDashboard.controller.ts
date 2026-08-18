import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "@/services/analytics.service";
import { sendSuccess } from "@/utils/api-response";

export class AdminDashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const range = (req.query.range as any) || "30d";
      const stats = await AnalyticsService.getDashboardStats(range);
      return sendSuccess(res, stats);
    } catch (err) {
      return next(err);
    }
  }

  static async getWidgets(req: Request, res: Response, next: NextFunction) {
    try {
      const widgets = await AnalyticsService.getDashboardWidgets();
      return sendSuccess(res, widgets);
    } catch (err) {
      return next(err);
    }
  }
}
