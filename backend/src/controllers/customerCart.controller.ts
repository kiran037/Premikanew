import { Request, Response } from "express";
import {
  CustomerCartService,
  addCartItemSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from "@/services/customerCart.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class CustomerCartController {
  /**
   * GET /api/customer/cart
   */
  static async getCart(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const cartData = await CustomerCartService.getCart(req.customer.id);
      return sendSuccess(res, cartData, "Cart retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve cart", undefined, 400);
    }
  }

  /**
   * POST /api/customer/cart/items
   */
  static async addItem(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const validation = addCartItemSchema.safeParse(req.body);
      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return sendError(
          res,
          firstIssue
            ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
            : "Invalid cart item input",
          undefined,
          400
        );
      }

      const updatedCart = await CustomerCartService.addItem(
        req.customer.id,
        validation.data
      );

      return sendSuccess(res, updatedCart, "Item added to cart", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to add item to cart", undefined, 400);
    }
  }

  /**
   * PATCH /api/customer/cart/items/:id
   */
  static async updateItemQuantity(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const validation = updateCartItemSchema.safeParse(req.body);
      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return sendError(
          res,
          firstIssue
            ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
            : "Invalid quantity input",
          undefined,
          400
        );
      }

      const updatedCart = await CustomerCartService.updateItemQuantity(
        req.customer.id,
        req.params.id,
        validation.data.quantity
      );

      return sendSuccess(res, updatedCart, "Cart item updated");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update cart item", undefined, 400);
    }
  }

  /**
   * DELETE /api/customer/cart/items/:id
   */
  static async removeItem(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const updatedCart = await CustomerCartService.removeItem(
        req.customer.id,
        req.params.id
      );

      return sendSuccess(res, updatedCart, "Cart item removed");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to remove cart item", undefined, 400);
    }
  }

  /**
   * DELETE /api/customer/cart
   */
  static async clearCart(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const clearedCart = await CustomerCartService.clearCart(req.customer.id);
      return sendSuccess(res, clearedCart, "Cart cleared successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to clear cart", undefined, 400);
    }
  }

  /**
   * POST /api/customer/cart/merge
   */
  static async mergeCart(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const validation = mergeCartSchema.safeParse(req.body);
      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return sendError(
          res,
          firstIssue
            ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
            : "Invalid guest cart items format",
          undefined,
          400
        );
      }

      const mergedCart = await CustomerCartService.mergeGuestCart(
        req.customer.id,
        validation.data.items
      );

      return sendSuccess(res, mergedCart, "Guest cart merged successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to merge cart", undefined, 400);
    }
  }
}
