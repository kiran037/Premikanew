import { Router } from "express";
import { AdminAuthController } from "@/controllers/adminAuth.controller";
import { AdminDashboardController } from "@/controllers/adminDashboard.controller";
import { AdminProductController } from "@/controllers/adminProduct.controller";
import { AdminCategoryController } from "@/controllers/adminCategory.controller";
import { AdminOrderController } from "@/controllers/adminOrder.controller";
import { AdminCouponController } from "@/controllers/adminCoupon.controller";
import { AdminCustomerController } from "@/controllers/adminCustomer.controller";
import { AdminReviewController } from "@/controllers/adminReview.controller";
import { AdminMarketingController } from "@/controllers/adminMarketing.controller";
import { AdminSettingsController } from "@/controllers/adminSettings.controller";
import { AdminSystemController } from "@/controllers/adminSystem.controller";

import { adminAuthMiddleware, requireRole } from "@/middleware/adminAuth.middleware";

const router = Router();

// Public Admin Auth Routes
router.post("/auth/login", AdminAuthController.login);
router.post("/auth/logout", AdminAuthController.logout);

// Protected Admin Routes (Require valid admin session)
router.use(adminAuthMiddleware);

router.get("/auth/me", AdminAuthController.me);

// Dashboard & Analytics
router.get("/dashboard/stats", AdminDashboardController.getStats);
router.get("/dashboard/widgets", AdminDashboardController.getWidgets);
router.get("/marketing/overview", AdminMarketingController.getOverview);

// Products Management
router.get("/products", AdminProductController.getProducts);
router.post("/products", requireRole("super_admin", "admin", "manager"), AdminProductController.createProduct);
router.post("/products/bulk", requireRole("super_admin", "admin", "manager"), AdminProductController.bulkAction);
router.get("/products/:id", AdminProductController.getProduct);
router.put("/products/:id", requireRole("super_admin", "admin", "manager"), AdminProductController.updateProduct);
router.delete("/products/:id", requireRole("super_admin", "admin"), AdminProductController.deleteProduct);
router.post("/products/:id/toggle", requireRole("super_admin", "admin", "manager"), AdminProductController.toggleProduct);
router.patch("/products/:id/toggle", requireRole("super_admin", "admin", "manager"), AdminProductController.toggleProduct);

// Categories Management
router.get("/categories", AdminCategoryController.getCategories);
router.post("/categories", requireRole("super_admin", "admin", "manager"), AdminCategoryController.createCategory);
router.post("/categories/bulk", requireRole("super_admin", "admin", "manager"), AdminCategoryController.bulkAction);
router.get("/categories/:id", AdminCategoryController.getCategory);
router.put("/categories/:id", requireRole("super_admin", "admin", "manager"), AdminCategoryController.updateCategory);
router.delete("/categories/:id", requireRole("super_admin", "admin"), AdminCategoryController.deleteCategory);
router.post("/categories/:id/toggle", requireRole("super_admin", "admin", "manager"), AdminCategoryController.toggleCategory);
router.patch("/categories/:id/toggle", requireRole("super_admin", "admin", "manager"), AdminCategoryController.toggleCategory);

// Orders & Shipping Management
router.get("/orders", AdminOrderController.getOrders);
router.post("/orders/bulk", requireRole("super_admin", "admin", "manager"), AdminOrderController.bulkAction);
router.get("/orders/:id", AdminOrderController.getOrder);
router.put("/orders/:id/status", requireRole("super_admin", "admin", "manager"), AdminOrderController.updateOrderStatus);
router.patch("/orders/:id/status", requireRole("super_admin", "admin", "manager"), AdminOrderController.updateOrderStatus);
router.get("/orders/:id/invoice", AdminOrderController.getInvoice);
router.post("/orders/:id/resend-email", AdminOrderController.resendEmail);
router.post("/orders/:id/shipment/create", requireRole("super_admin", "admin", "manager"), AdminOrderController.createShipment);
router.post("/orders/:id/shipment/sync", AdminOrderController.syncShipment);
router.get("/orders/:id/shipment/label", AdminOrderController.getShipmentLabel);

// Coupons Management
router.get("/coupons", AdminCouponController.getCoupons);
router.post("/coupons", requireRole("super_admin", "admin", "manager"), AdminCouponController.createCoupon);
router.post("/coupons/bulk", requireRole("super_admin", "admin", "manager"), AdminCouponController.bulkAction);
router.get("/coupons/:id", AdminCouponController.getCoupon);
router.put("/coupons/:id", requireRole("super_admin", "admin", "manager"), AdminCouponController.updateCoupon);
router.delete("/coupons/:id", requireRole("super_admin", "admin"), AdminCouponController.deleteCoupon);
router.post("/coupons/:id/duplicate", requireRole("super_admin", "admin", "manager"), AdminCouponController.duplicateCoupon);

// Customers Management
router.get("/customers", AdminCustomerController.getCustomers);
router.get("/customers/:id", AdminCustomerController.getCustomer);

// Product Reviews Management
router.get("/reviews", AdminReviewController.getReviews);
router.put("/reviews/:id", requireRole("super_admin", "admin", "manager"), AdminReviewController.updateReview);
router.patch("/reviews/:id", requireRole("super_admin", "admin", "manager"), AdminReviewController.updateReview);
router.delete("/reviews/:id", requireRole("super_admin", "admin"), AdminReviewController.deleteReview);

// Store Settings
router.get("/settings/store", AdminSettingsController.getStoreSettings);
router.put("/settings/store", requireRole("super_admin", "admin"), AdminSettingsController.updateStoreSettings);
router.get("/settings/contact", AdminSettingsController.getContactSettings);
router.put("/settings/contact", requireRole("super_admin", "admin"), AdminSettingsController.updateContactSettings);
router.get("/settings/seo", AdminSettingsController.getSeoSettings);
router.put("/settings/seo", requireRole("super_admin", "admin"), AdminSettingsController.updateSeoSettings);
router.get("/settings/delhivery", AdminSettingsController.getDelhiverySettings);
router.put("/settings/delhivery", requireRole("super_admin", "admin"), AdminSettingsController.updateDelhiverySettings);
router.get("/settings/social", AdminSettingsController.getSocialLinks);
router.post("/settings/social", requireRole("super_admin", "admin"), AdminSettingsController.createSocialLink);
router.put("/settings/social/:id", requireRole("super_admin", "admin"), AdminSettingsController.updateSocialLink);
router.delete("/settings/social/:id", requireRole("super_admin", "admin"), AdminSettingsController.deleteSocialLink);

// System Info
router.get("/system", AdminSystemController.getSystemInfo);

export default router;
