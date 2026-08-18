import { Request, Response, NextFunction } from "express";
import { CategoryService } from "@/services/category.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getCategories();
      return sendSuccess(res, categories);
    } catch (err) {
      return next(err);
    }
  }

  static async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await CategoryService.getCategoryBySlug(slug);

      if (!category) {
        return sendError(res, "Category not found", undefined, 404);
      }

      return sendSuccess(res, category);
    } catch (err) {
      return next(err);
    }
  }
}
