import { Request, Response, NextFunction } from "express";
import { MarketingService } from "@/services/marketing.service";
import { sendSuccess } from "@/utils/api-response";

export class AdminMarketingController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await MarketingService.getMarketingOverview();
      return sendSuccess(res, overview);
    } catch (err) {
      return next(err);
    }
  }
}
