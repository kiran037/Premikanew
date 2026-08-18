import { Request, Response, NextFunction } from "express";
import { CategoryService } from "@/services/category.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class AdminCategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;

      const result = await CategoryService.getAdminCategoriesList({ page, limit, search });
      return sendSuccess(res, result.items, result.pagination);
    } catch (err) {
      return next(err);
    }
  }

  static async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getAdminCategoryById(id);

      if (!category) {
        return sendError(res, "Category not found", undefined, 404);
      }

      return sendSuccess(res, category);
    } catch (err) {
      return next(err);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await CategoryService.createAdminCategory(req.body);
      return sendSuccess(res, created, "Category created successfully", 201);
    } catch (err: any) {
      return sendError(res, err.message || "Failed to create category", undefined, 400);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await CategoryService.updateAdminCategory(id, req.body);
      return sendSuccess(res, updated, "Category updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update category", undefined, 400);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CategoryService.deleteAdminCategory(id);
      return sendSuccess(res, null, "Category deleted successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to delete category", undefined, 400);
    }
  }

  static async toggleCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await CategoryService.toggleAdminCategoryStatus(id);
      return sendSuccess(res, updated, "Category status toggled");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to toggle status", undefined, 400);
    }
  }

  static async bulkAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, action } = req.body || {};

      if (!Array.isArray(ids) || ids.length === 0) {
        return sendError(res, "No categories selected", undefined, 400);
      }

      if (!["activate", "deactivate", "delete"].includes(action)) {
        return sendError(res, "Invalid bulk action", undefined, 400);
      }

      const result = await CategoryService.bulkAdminCategoryAction(ids, action);
      return sendSuccess(res, result, `Bulk ${action} executed successfully`);
    } catch (err: any) {
      return sendError(res, err.message || "Bulk action failed", undefined, 400);
    }
  }
}
