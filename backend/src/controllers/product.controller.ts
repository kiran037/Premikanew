import { Request, Response, NextFunction } from "express";
import { ProductService } from "@/services/product.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const featured = req.query.featured !== undefined ? req.query.featured === "true" : undefined;
      const newArrival = req.query.newArrival !== undefined ? req.query.newArrival === "true" : undefined;
      const isCombo = req.query.isCombo !== undefined ? req.query.isCombo === "true" : undefined;
      const sort = req.query.sort as any;

      const result = await ProductService.getProducts({
        page,
        limit,
        category,
        search,
        featured,
        newArrival,
        sort,
      });

      return sendSuccess(res, result.items, result.pagination);
    } catch (err) {
      return next(err);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug);

      if (!product) {
        return sendError(res, "Product not found", undefined, 404);
      }

      return sendSuccess(res, product);
    } catch (err) {
      return next(err);
    }
  }
}
