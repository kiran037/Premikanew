import { Request, Response, NextFunction } from "express";
import { CustomerService } from "@/services/customer.service";
import { sendSuccess, sendError } from "@/utils/api-response";

export class AdminCustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;
      const sortBy = req.query.sortBy as any;

      const result = await CustomerService.getAdminCustomersList({ page, limit, search, sortBy });
      return sendSuccess(res, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getAdminCustomerById(id);

      if (!customer) {
        return sendError(res, "Customer not found", undefined, 404);
      }

      return sendSuccess(res, customer);
    } catch (err) {
      return next(err);
    }
  }
}
