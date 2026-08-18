import { Router } from "express";
import { ProductController } from "@/controllers/product.controller";
import { CategoryController } from "@/controllers/category.controller";
import { CouponController } from "@/controllers/coupon.controller";
import { OrderController } from "@/controllers/order.controller";
import { StoreController } from "@/controllers/store.controller";
import { WebhookController } from "@/controllers/webhook.controller";
import { EmailController } from "@/controllers/email.controller";

const router = Router();

// Storefront Products & Categories
router.get("/products", ProductController.getProducts);
router.get("/products/:slug", ProductController.getProductBySlug);
router.get("/categories", CategoryController.getCategories);
router.get("/categories/:slug", CategoryController.getCategoryBySlug);

// Storefront Coupons
router.post("/coupons/validate", CouponController.validateCoupon);

// Storefront Orders & Checkout
router.post("/createOrder", OrderController.createPaymentOrder);
router.post("/verifyOrder", OrderController.verifyPaymentOrder);
router.post("/orders", OrderController.createGuestOrder);
router.post("/orders/track", OrderController.trackOrder);
router.get("/orders/:orderNumber/invoice", OrderController.getInvoice);

// Maintenance Mode Health
router.get("/maintenance", StoreController.getMaintenanceMode);

// Webhooks
router.post("/webhooks/delhivery", WebhookController.handleDelhiveryWebhook);

// Test Email
router.post("/test-email", EmailController.handleTestEmail);

export default router;
