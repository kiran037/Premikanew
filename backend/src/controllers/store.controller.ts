import { Request, Response, NextFunction } from "express";
import { StoreService } from "@/services/store.service";

export class StoreController {
  static async getMaintenanceMode(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await StoreService.getStoreSettings();
      return res.status(200).json({ maintenanceMode: !!settings?.maintenanceMode });
    } catch (error) {
      console.error("Error in maintenance API route:", error);
      return res.status(200).json({ maintenanceMode: false });
    }
  }
}
