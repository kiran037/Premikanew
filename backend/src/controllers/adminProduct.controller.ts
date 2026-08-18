import { Request, Response, NextFunction } from "express";
import { ProductService } from "@/services/product.service";
import { ProductRepository } from "@/repositories/product.repository";
import { sendSuccess, sendError } from "@/utils/api-response";

export class AdminProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const featured = req.query.featured !== undefined ? req.query.featured === "true" : undefined;
      const newArrival = req.query.newArrival !== undefined ? req.query.newArrival === "true" : undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
      const sortBy = req.query.sortBy as any;

      const result = await ProductService.getAdminProductsList({
        page,
        limit,
        search,
        categoryId,
        featured,
        newArrival,
        isActive,
        sortBy,
      });

      return sendSuccess(res, result.items, result.pagination);
    } catch (err) {
      return next(err);
    }
  }

  static async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductRepository.findAdminProductById(id);

      if (!product) {
        return sendError(res, "Product not found", undefined, 404);
      }

      return sendSuccess(res, product);
    } catch (err) {
      return next(err);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await ProductService.createAdminProduct(req.body);
      return sendSuccess(res, created, "Product created successfully", 201);
    } catch (err: any) {
      return sendError(res, err.message || "Failed to create product", undefined, 400);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProductService.updateAdminProduct(id, req.body);
      return sendSuccess(res, updated, "Product updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update product", undefined, 400);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ProductService.deleteAdminProduct(id);
      return sendSuccess(res, null, "Product deleted successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to delete product", undefined, 400);
    }
  }

  static async toggleProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { field } = req.body || {};

      if (!field || !["isActive", "featured", "newArrival"].includes(field)) {
        return sendError(res, "Invalid toggle field", undefined, 400);
      }

      const updated = await ProductService.toggleAdminProductStatus(id, field);
      return sendSuccess(res, updated, `Toggled ${field} successfully`);
    } catch (err: any) {
      return sendError(res, err.message || "Failed to toggle status", undefined, 400);
    }
  }

  static async bulkAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, action } = req.body || {};

      if (!Array.isArray(ids) || ids.length === 0) {
        return sendError(res, "No products selected", undefined, 400);
      }

      if (!["activate", "deactivate", "delete"].includes(action)) {
        return sendError(res, "Invalid bulk action", undefined, 400);
      }

      const result = await ProductService.bulkAdminProductAction(ids, action);
      return sendSuccess(res, result, `Bulk ${action} executed successfully`);
    } catch (err: any) {
      return sendError(res, err.message || "Bulk action failed", undefined, 400);
    }
  }
}
