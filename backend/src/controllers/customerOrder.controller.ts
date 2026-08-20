import { Request, Response } from "express";
import { CustomerOrderService } from "@/services/customerOrder.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class CustomerOrderController {
  /**
   * GET /api/customer/orders
   */
  static async getOrders(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const { page, limit, status } = req.query;

      const result = await CustomerOrderService.getOrders(req.customer.id, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status ? String(status) : undefined,
      });

      return sendSuccess(
        res,
        { items: result.items },
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      );
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve orders", undefined, 400);
    }
  }

  /**
   * GET /api/customer/orders/:orderNumber
   */
  static async getOrderByNumber(req: Request, res: Response) {
    try {
      if (!req.customer) {
        return sendError(res, "Unauthenticated request", undefined, 401);
      }

      const orderNumber = req.params.orderNumber;
      if (!orderNumber) {
        return sendError(res, "Order number is required", undefined, 400);
      }

      const order = await CustomerOrderService.getOrderByNumber(
        req.customer.id,
        orderNumber
      );

      return sendSuccess(res, { order }, "Order details retrieved successfully");
    } catch (error: any) {
      return sendError(
        res,
        error.message || "Order not found or access denied",
        undefined,
        404
      );
    }
  }
}
