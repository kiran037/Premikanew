import { Router } from "express";
import { CustomerAuthController } from "@/controllers/customerAuth.controller";
import { CustomerProfileController } from "@/controllers/customerProfile.controller";
import { CustomerAddressController } from "@/controllers/customerAddress.controller";
import { CustomerWishlistController } from "@/controllers/customerWishlist.controller";
import { CustomerCartController } from "@/controllers/customerCart.controller";
import { CustomerOrderController } from "@/controllers/customerOrder.controller";

import { customerAuthMiddleware } from "@/middleware/customerAuth.middleware";

const router = Router();

// ======================================================
// Public / Semi-Public Customer Auth Routes
// ======================================================
router.post("/auth/sync", CustomerAuthController.syncAuth);

// ======================================================
// Protected Customer Routes (Require valid Supabase JWT)
// ======================================================
router.use(customerAuthMiddleware);

// Auth Me
router.get("/auth/me", CustomerAuthController.getMe);

// Profile Management
router.get("/profile", CustomerProfileController.getProfile);
router.put("/profile", CustomerProfileController.updateProfile);
router.patch("/profile", CustomerProfileController.updateProfile);

// Address Book Management
router.get("/addresses", CustomerAddressController.getAddresses);
router.get("/addresses/:id", CustomerAddressController.getAddressById);
router.post("/addresses", CustomerAddressController.createAddress);
router.put("/addresses/:id", CustomerAddressController.updateAddress);
router.patch("/addresses/:id", CustomerAddressController.updateAddress);
router.delete("/addresses/:id", CustomerAddressController.deleteAddress);
router.post("/addresses/:id/default", CustomerAddressController.setDefaultAddress);

// Wishlist Management
router.get("/wishlist", CustomerWishlistController.getWishlist);
router.post("/wishlist/items", CustomerWishlistController.addItem);
router.delete("/wishlist/items/:productId", CustomerWishlistController.removeItem);
router.post("/wishlist/toggle", CustomerWishlistController.toggleItem);

// Cart Management
router.get("/cart", CustomerCartController.getCart);
router.post("/cart/items", CustomerCartController.addItem);
router.patch("/cart/items/:id", CustomerCartController.updateItemQuantity);
router.delete("/cart/items/:id", CustomerCartController.removeItem);
router.delete("/cart", CustomerCartController.clearCart);
router.post("/cart/merge", CustomerCartController.mergeCart);

// Order History & Tracking (Scoped to Customer)
router.get("/orders", CustomerOrderController.getOrders);
router.get("/orders/:orderNumber", CustomerOrderController.getOrderByNumber);

export default router;
