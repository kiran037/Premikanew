import { Request, Response } from "express";
import { CustomerWishlistService } from "@/services/customerWishlist.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class CustomerWishlistController {
  /**
   * GET /api/customer/wishlist
   */
  static async getWishlist(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const wishlistData = await CustomerWishlistService.getWishlist(req.customer.id);
      return sendSuccess(res, wishlistData, "Wishlist retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve wishlist", undefined, 400);
    }
  }

  /**
   * POST /api/customer/wishlist/items
   */
  static async addItem(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const productId = req.body?.productId;
      if (!productId || typeof productId !== "string") {
        return sendError(res, "Product ID is required", undefined, 400);
      }

      const result = await CustomerWishlistService.addItem(req.customer.id, productId);
      return sendSuccess(res, result, result.message || "Item added to wishlist", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to add item to wishlist", undefined, 400);
    }
  }

  /**
   * DELETE /api/customer/wishlist/items/:productId
   */
  static async removeItem(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const targetId = req.params.productId;
      await CustomerWishlistService.removeItem(req.customer.id, targetId);
      return sendSuccess(res, { success: true }, "Item removed from wishlist");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to remove item from wishlist", undefined, 400);
    }
  }

  /**
   * POST /api/customer/wishlist/toggle
   */
  static async toggleItem(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const productId = req.body?.productId;
      if (!productId || typeof productId !== "string") {
        return sendError(res, "Product ID is required", undefined, 400);
      }

      const result = await CustomerWishlistService.toggleItem(req.customer.id, productId);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to toggle wishlist item", undefined, 400);
    }
  }
}
