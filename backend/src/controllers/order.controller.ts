import { Request, Response, NextFunction } from "express";
import { OrderService } from "@/services/order.service";
import { PaymentService } from "@/services/payment.service";
import { StoreService } from "@/services/store.service";
import { validateCoupon, recordCouponUsage } from "@/utils/validate-coupon";
import { generatePdfBuffer } from "@/utils/pdf-generator";
import { checkoutInputSchema } from "@/validations/checkout.schema";
import { trackOrderSchema } from "@/validations/track-order.schema";
import { sendSuccess, sendError } from "@/utils/api-response";

const orderRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, maxRequests = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const record = orderRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    orderRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}

export class OrderController {
  /**
   * Create Razorpay payment order
   */
  static async createPaymentOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "127.0.0.1";
      const ipAddress = rawIp.trim();

      if (isRateLimited(ipAddress, 20, 60000)) {
        return sendError(res, "Too many order requests. Please try again later.", undefined, 429);
      }

      // Maintenance Mode Check
      const storeSettings = await StoreService.getStoreSettings();
      if (storeSettings?.maintenanceMode) {
        return sendError(res, "The store is currently under maintenance. Please try again later.", undefined, 503);
      }

      const body = req.body || {};

      let checkoutInput;
      if (body.customer && body.items) {
        checkoutInput = body;
      } else {
        const c = body.customerInfo || {};
        checkoutInput = {
          customer: {
            fullName: c.name || "Guest Customer",
            email: c.email || "",
            phone: c.phone || "",
            addressLine1: c.address?.line1 || "",
            addressLine2: c.address?.line2 || "",
            city: c.address?.city || "",
            state: c.address?.state || "",
            postalCode: c.address?.postal_code || "",
            country: c.address?.country || "IN",
          },
          items: body.cartItems || [],
          couponCode: body.couponCode,
        };
      }

      // Server-side revalidation of coupon if provided
      if (checkoutInput.couponCode && typeof checkoutInput.couponCode === "string" && checkoutInput.couponCode.trim()) {
        let serverSubtotal = 0;
        for (const item of checkoutInput.items) {
          serverSubtotal += Number(item.price || 0) * (item.quantity || 1);
        }

        const validation = await validateCoupon(checkoutInput.couponCode, serverSubtotal);
        if (!validation.valid) {
          return sendError(res, validation.message || "Invalid or expired coupon code", { error: "Coupon validation failed" }, 400);
        }
      }

      const razorpayOrder = await PaymentService.createPaymentOrder(checkoutInput as any);
      return res.status(201).json(razorpayOrder);
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      return sendError(res, error.message || "Failed to create Razorpay order", { error: "Payment creation failed" }, 400);
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  static async verifyPaymentOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const storeSettings = await StoreService.getStoreSettings();
      if (storeSettings?.maintenanceMode) {
        return sendError(res, "The store is currently under maintenance. Please try again later.", undefined, 503);
      }

      const payload = req.body || {};
      const result = await PaymentService.verifyPaymentSignature(payload);

      if (!result.isOk) {
        return res.status(400).json({ message: result.message || "Payment verification failed", isOk: false });
      }

      // Record coupon usage ONLY after successful payment verification
      const couponCodeOrId = payload.couponCode || payload.couponId;
      if (couponCodeOrId) {
        await recordCouponUsage(couponCodeOrId, payload.customerInfo?.id || payload.customerId).catch((err) => {
          console.error("Non-fatal error recording coupon usage:", err);
        });
      }

      return res.status(200).json({ message: "Payment verified successfully", isOk: true, orderId: result.orderId });
    } catch (error: any) {
      console.error("Error verifying payment signature:", error);
      return res.status(500).json({ message: error.message || "Internal server error during verification", isOk: false });
    }
  }

  /**
   * Create Guest Order (Direct checkout)
   */
  static async createGuestOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = checkoutInputSchema.safeParse(req.body);

      if (!validationResult.success) {
        const firstIssue = validationResult.error.issues[0];
        const errorMessage = firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid checkout data";
        return sendError(res, errorMessage, undefined, 400);
      }

      const orderResult = await OrderService.createGuestOrder(validationResult.data);
      return sendSuccess(res, orderResult, "Order created successfully", 201);
    } catch (err: any) {
      console.error("Error creating guest order:", err);
      return sendError(res, err.message || "Failed to create order. Please try again.", undefined, 400);
    }
  }

  /**
   * Track Guest Order
   */
  static async trackOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = trackOrderSchema.safeParse(req.body);

      if (!validationResult.success) {
        const firstIssue = validationResult.error.issues[0];
        return sendError(res, firstIssue ? `${firstIssue.message}` : "Invalid order lookup criteria", undefined, 400);
      }

      const { orderNumber, identifier } = validationResult.data;
      const trackingData = await OrderService.trackGuestOrder(orderNumber, identifier);

      return sendSuccess(res, trackingData, "Order details retrieved successfully");
    } catch (err: any) {
      console.error("Error in order tracking API:", err);
      return sendError(res, err.message || "Failed to retrieve order tracking information", undefined, 404);
    }
  }

  /**
   * Download Invoice PDF
   */
  static async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderNumber } = req.params;
      const identifier = (req.query.email || req.query.phone || req.query.identifier) as string;

      if (!identifier) {
        return sendError(res, "Email or phone identifier is required to download invoice", undefined, 400);
      }

      const orderData = await OrderService.trackGuestOrder(orderNumber, identifier);

      const pdfBuffer = await generatePdfBuffer({
        orderNumber: orderData.orderNumber,
        orderDate: new Date(orderData.orderDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        paymentStatus: orderData.paymentStatus,
        orderStatus: orderData.orderStatus,
        customerName: orderData.customer.name,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone || "",
        shippingAddress: orderData.address
          ? {
              line1: orderData.address.line1,
              line2: orderData.address.line2 || undefined,
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
        items: orderData.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        shippingCharge: orderData.shippingCharge,
        tax: orderData.tax,
        total: orderData.total,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Invoice-${orderData.orderNumber}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } catch (err: any) {
      console.error("Error generating invoice PDF:", err);
      return sendError(res, err.message || "Failed to generate PDF invoice", undefined, 404);
    }
  }
}
