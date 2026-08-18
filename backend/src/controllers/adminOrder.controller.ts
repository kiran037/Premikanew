import { Request, Response, NextFunction } from "express";
import { OrderService } from "@/services/order.service";
import { ShipmentService } from "@/services/shipment.service";
import { sendOrderConfirmationEmail } from "@/utils/emailService";
import { generatePdfBuffer } from "@/utils/pdf-generator";
import { adminShipmentCreateSchema } from "@/validations/admin-shipment.schema";
import { OrderData } from "@/types";
import { sendSuccess, sendError } from "@/utils/api-response";

export class AdminOrderController {
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;
      const orderStatus = req.query.orderStatus as string | undefined;
      const paymentStatus = req.query.paymentStatus as string | undefined;
      const range = req.query.range as any;
      const sortBy = req.query.sortBy as any;

      const result = await OrderService.getAdminOrdersList({
        page,
        limit,
        search,
        orderStatus,
        paymentStatus,
        range,
        sortBy,
      });

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

  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const orderData = await OrderService.getAdminOrderById(id);

      if (!orderData) {
        return sendError(res, "Order not found", undefined, 404);
      }

      return sendSuccess(res, orderData);
    } catch (err) {
      return next(err);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await OrderService.updateAdminOrderStatus(id, req.body);
      return sendSuccess(res, updated, "Order status updated successfully");
    } catch (err: any) {
      return sendError(res, err.message || "Failed to update order status", undefined, 400);
    }
  }

  static async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const orderData = await OrderService.getAdminOrderById(id);

      if (!orderData || !orderData.order) {
        return sendError(res, "Order not found", undefined, 404);
      }

      const pdfBuffer = await generatePdfBuffer({
        orderNumber: orderData.order.orderNumber,
        orderDate: new Date(orderData.order.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        paymentStatus: orderData.payment?.status || "pending",
        orderStatus: orderData.order.status,
        customerName: `${orderData.customer?.firstName || ""} ${orderData.customer?.lastName || ""}`.trim() || "Customer",
        customerEmail: orderData.customer?.email || "",
        customerPhone: orderData.customer?.phone || "",
        shippingAddress: orderData.address
          ? {
              line1: orderData.address.addressLine1,
              line2: orderData.address.addressLine2 || undefined,
              city: orderData.address.city,
              state: orderData.address.state,
              postalCode: orderData.address.postalCode,
              country: orderData.address.country,
            }
          : {
              line1: "N/A",
              city: "N/A",
              state: "N/A",
              postalCode: "N/A",
              country: "India",
            },
        items: orderData.items.map((i: any) => ({
          name: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
        subtotal: orderData.order.subtotal,
        discount: orderData.order.discount,
        shippingCharge: orderData.order.shippingCharge,
        tax: orderData.order.tax,
        total: orderData.order.total,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Invoice-${orderData.order.orderNumber}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } catch (err: any) {
      console.error("Error generating admin invoice PDF:", err);
      return sendError(res, err.message || "Failed to generate PDF invoice", undefined, 500);
    }
  }

  static async resendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const orderData = await OrderService.getAdminOrderById(id);

      if (!orderData || !orderData.customer?.email) {
        return sendError(res, "Order or customer email not found", undefined, 404);
      }

      const orderDataPayload: OrderData = {
        orderId: orderData.order.orderNumber,
        customerInfo: {
          name: `${orderData.customer.firstName || ""} ${orderData.customer.lastName || ""}`.trim() || "Customer",
          email: orderData.customer.email,
          phone: orderData.customer.phone || "",
          address: {
            line1: orderData.address?.addressLine1 || "N/A",
            line2: orderData.address?.addressLine2 || undefined,
            city: orderData.address?.city || "N/A",
            state: orderData.address?.state || "N/A",
            postal_code: orderData.address?.postalCode || "N/A",
            country: orderData.address?.country || "India",
          },
        },
        cartItems: orderData.items.map((i: any) => ({
          id: i.productId,
          name: i.productName,
          price: i.unitPrice,
          quantity: i.quantity,
          images: [],
          category: "clothing",
        })),
        orderSummary: {
          subtotal: orderData.order.subtotal,
          shipping: orderData.order.shippingCharge,
          total: orderData.order.total,
        },
      };

      const sent = await sendOrderConfirmationEmail(orderDataPayload);

      return sendSuccess(
        res,
        null,
        sent.success ? "Order confirmation email sent successfully" : "Email service attempted (logged or sent)"
      );
    } catch (err: any) {
      console.error("Error resending order email:", err);
      return sendError(res, err.message || "Failed to send email", undefined, 500);
    }
  }

  static async bulkAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, status } = req.body || {};

      if (!Array.isArray(ids) || ids.length === 0) {
        return sendError(res, "No orders selected", undefined, 400);
      }

      const validStatuses = [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ];

      if (!validStatuses.includes(status)) {
        return sendError(res, "Invalid target status", undefined, 400);
      }

      await OrderService.bulkAdminOrderStatusUpdate(ids, status);
      return sendSuccess(res, null, `Bulk status updated to ${status}`);
    } catch (err: any) {
      return sendError(res, err.message || "Bulk update failed", undefined, 400);
    }
  }

  static async createShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: orderId } = req.params;
      const validationResult = adminShipmentCreateSchema.safeParse(req.body);

      if (!validationResult.success) {
        const firstIssue = validationResult.error.issues[0]?.message || "Invalid shipment parameters";
        return sendError(res, firstIssue, validationResult.error.flatten(), 400);
      }

      const result = await ShipmentService.createDelhiveryShipmentForOrder(orderId, validationResult.data);

      return sendSuccess(
        res,
        result,
        `Delhivery shipment created successfully with AWB: ${result.waybill}`,
        201
      );
    } catch (err: any) {
      console.error("Error creating Delhivery shipment:", err);
      return sendError(res, err.message || "Failed to create Delhivery shipment", undefined, 400);
    }
  }

  static async syncShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: orderId } = req.params;
      const result = await ShipmentService.syncShipmentStatus(orderId);
      return sendSuccess(res, result, "Shipment tracking status synced successfully");
    } catch (err: any) {
      console.error("Error syncing Delhivery shipment status:", err);
      return sendError(res, err.message || "Failed to sync shipment status", undefined, 400);
    }
  }

  static async getShipmentLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: orderId } = req.params;
      const result = await ShipmentService.getShipmentLabel(orderId);

      if (!result.success) {
        return sendError(res, result.error || "Failed to fetch label", undefined, 400);
      }

      return sendSuccess(res, result);
    } catch (err: any) {
      console.error("Error fetching shipment label:", err);
      return sendError(res, err.message || "Failed to retrieve shipping label", undefined, 500);
    }
  }
}
