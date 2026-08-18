import { Request, Response, NextFunction } from "express";
import { StoreService } from "@/services/store.service";
import { DelhiverySettingsService } from "@/services/delhivery-settings.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class AdminSettingsController {
  // Store Settings
  static async getStoreSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await StoreService.getStoreSettings();
      return sendSuccess(res, settings);
    } catch (err) {
      return next(err);
    }
  }

  static async updateStoreSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await StoreService.updateStoreSettings(req.body);
      return sendSuccess(res, updated, "Store settings updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update store settings", undefined, 400);
    }
  }

  // Contact Information
  static async getContactSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const contacts = await StoreService.getStoreContacts();
      return sendSuccess(res, contacts);
    } catch (err) {
      return next(err);
    }
  }

  static async updateContactSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await StoreService.updateStoreContacts(req.body);
      return sendSuccess(res, updated, "Contact information updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update contact information", undefined, 400);
    }
  }

  // Global SEO Settings
  static async getSeoSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const seo = await StoreService.getSeoSettings();
      return sendSuccess(res, seo);
    } catch (err) {
      return next(err);
    }
  }

  static async updateSeoSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await StoreService.updateSeoSettings(req.body);
      return sendSuccess(res, updated, "SEO settings updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update SEO settings", undefined, 400);
    }
  }

  // Delhivery Settings
  static async getDelhiverySettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await DelhiverySettingsService.getSettings();
      return sendSuccess(res, settings);
    } catch (err) {
      return next(err);
    }
  }

  static async updateDelhiverySettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await DelhiverySettingsService.updateSettings(req.body);
      return sendSuccess(res, updated, "Delhivery pickup settings updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update Delhivery settings", undefined, 400);
    }
  }

  // Social Links
  static async getSocialLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const links = await StoreService.getSocialLinks();
      return sendSuccess(res, links);
    } catch (err) {
      return next(err);
    }
  }

  static async createSocialLink(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await StoreService.createSocialLink(req.body);
      return sendSuccess(res, created, "Social link created successfully", 201);
    } catch (err: any) {
      return sendError(res, err.message || "Failed to create social link", undefined, 400);
    }
  }

  static async updateSocialLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await StoreService.updateSocialLink(id, req.body);
      return sendSuccess(res, updated, "Social link updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update social link", undefined, 400);
    }
  }

  static async deleteSocialLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await StoreService.deleteSocialLink(id);
      return sendSuccess(res, null, "Social link deleted successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to delete social link", undefined, 400);
    }
  }
}
