import { Request, Response, NextFunction } from "express";
import { SystemService } from "@/services/system.service";
import { sendSuccess } from "@/utils/api-response";

export class AdminSystemController {
  static async getSystemInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const info = await SystemService.getSystemInfo();
      return sendSuccess(res, info);
    } catch (err) {
      return next(err);
    }
  }
}
