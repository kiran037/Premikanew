import { db } from "@/db/client";
import { orders, orderItems, payments, shipments, shipmentTracking } from "@/db/schema/order";
import { customerAddresses } from "@/db/schema/customer";
import { productImages } from "@/db/schema/product";
import { eq, and, desc, count, inArray } from "drizzle-orm";

export interface CustomerOrderListQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export class CustomerOrderService {
  /**
   * Get paginated orders list strictly scoped to authenticated customer
   */
  static async getOrders(customerId: string, options: CustomerOrderListQuery = {}) {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Math.min(50, Number(options.limit || 10)));
    const offset = (page - 1) * limit;

    const conditions = [eq(orders.customerId, customerId)];
    if (options.status && options.status.trim()) {
      conditions.push(eq(orders.status, options.status.trim() as any));
    }

    const whereClause = and(...conditions);

    // 1. Fetch Total Count
    const countRes = await db
      .select({ count: count() })
      .from(orders)
      .where(whereClause);
    const total = Number(countRes[0]?.count || 0);

    if (total === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
      };
    }

    // 2. Fetch Paginated Customer Orders
    const customerOrders = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const orderIds = customerOrders.map((o) => o.id);

    // 3. Fetch Items & Payments for these orders
    const [itemRows, paymentRows, shipmentRows] = await Promise.all([
      db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds)),
      db
        .select()
        .from(payments)
        .where(inArray(payments.orderId, orderIds)),
      db
        .select()
        .from(shipments)
        .where(inArray(shipments.orderId, orderIds)),
    ]);

    // Fetch primary images for items
    const productIds = Array.from(new Set(itemRows.map((i) => i.productId)));
    const imagesMap = new Map<string, string>();
    if (productIds.length > 0) {
      const images = await db
        .select()
        .from(productImages)
        .where(
          and(
            inArray(productImages.productId, productIds),
            eq(productImages.isPrimary, true)
          )
        );
      images.forEach((img) => imagesMap.set(img.productId, img.image));
    }

    const paymentsMap = new Map<string, any>();
    paymentRows.forEach((p) => paymentsMap.set(p.orderId, p));

    const shipmentsMap = new Map<string, any>();
    shipmentRows.forEach((s) => shipmentsMap.set(s.orderId, s));

    const itemsByOrder = new Map<string, any[]>();
    itemRows.forEach((item) => {
      const existing = itemsByOrder.get(item.orderId) || [];
      existing.push({
        id: item.id,
        productId: item.productId,
        name: item.productName,
        sku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        image: imagesMap.get(item.productId) || "/placeholder.svg",
      });
      itemsByOrder.set(item.orderId, existing);
    });

    const items = customerOrders.map((ord) => {
      const ordItems = itemsByOrder.get(ord.id) || [];
      const payment = paymentsMap.get(ord.id);
      const shipment = shipmentsMap.get(ord.id);

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        status: ord.status,
        paymentStatus: payment ? payment.status : "pending",
        paymentMethod: payment ? payment.paymentMethod : "N/A",
        subtotal: ord.subtotal,
        discount: ord.discount,
        shippingCharge: ord.shippingCharge,
        tax: ord.tax,
        total: ord.total,
        notes: ord.notes,
        createdAt: ord.createdAt,
        updatedAt: ord.updatedAt,
        itemCount: ordItems.reduce((acc, i) => acc + i.quantity, 0),
        items: ordItems,
        shipment: shipment
          ? {
              status: shipment.status,
              courierName: shipment.courierName,
              trackingNumber: shipment.trackingNumber,
              trackingUrl: shipment.trackingUrl,
              estimatedDeliveryAt: shipment.estimatedDeliveryAt,
            }
          : null,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single order by orderNumber strictly scoped to authenticated customer ID
   */
  static async getOrderByNumber(customerId: string, orderNumber: string) {
    const targetOrder = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.orderNumber, orderNumber.trim()),
          eq(orders.customerId, customerId)
        )
      )
      .then((r) => r[0] || null);

    if (!targetOrder) {
      throw new Error("Order not found or unauthorized access");
    }

    const [itemRows, paymentRows, shipmentRows, addressRows] = await Promise.all([
      db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, targetOrder.id)),
      db
        .select()
        .from(payments)
        .where(eq(payments.orderId, targetOrder.id))
        .then((r) => r[0] || null),
      db
        .select()
        .from(shipments)
        .where(eq(shipments.orderId, targetOrder.id))
        .then((r) => r[0] || null),
      db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customerId))
        .orderBy(desc(customerAddresses.isDefault))
        .then((r) => r[0] || null),
    ]);

    // Fetch tracking history if shipment exists
    let trackingHistory: any[] = [];
    if (shipmentRows) {
      trackingHistory = await db
        .select()
        .from(shipmentTracking)
        .where(eq(shipmentTracking.shipmentId, shipmentRows.id))
        .orderBy(desc(shipmentTracking.createdAt));
    }

    // Fetch primary images
    const productIds = itemRows.map((i) => i.productId);
    const imagesMap = new Map<string, string>();
    if (productIds.length > 0) {
      const images = await db
        .select()
        .from(productImages)
        .where(
          and(
            inArray(productImages.productId, productIds),
            eq(productImages.isPrimary, true)
          )
        );
      images.forEach((img) => imagesMap.set(img.productId, img.image));
    }

    const formattedItems = itemRows.map((item) => ({
      id: item.id,
      productId: item.productId,
      productSizeId: item.productSizeId,
      productHeightId: item.productHeightId,
      name: item.productName,
      sku: item.productSku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      image: imagesMap.get(item.productId) || "/placeholder.svg",
    }));

    return {
      id: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      status: targetOrder.status,
      subtotal: targetOrder.subtotal,
      discount: targetOrder.discount,
      shippingCharge: targetOrder.shippingCharge,
      tax: targetOrder.tax,
      total: targetOrder.total,
      notes: targetOrder.notes,
      createdAt: targetOrder.createdAt,
      updatedAt: targetOrder.updatedAt,
      payment: paymentRows
        ? {
            id: paymentRows.id,
            paymentMethod: paymentRows.paymentMethod,
            status: paymentRows.status,
            amount: paymentRows.amount,
            gateway: paymentRows.gateway,
            gatewayOrderId: paymentRows.gatewayOrderId,
            gatewayPaymentId: paymentRows.gatewayPaymentId,
            paidAt: paymentRows.paidAt,
          }
        : null,
      shipment: shipmentRows
        ? {
            id: shipmentRows.id,
            status: shipmentRows.status,
            courierName: shipmentRows.courierName,
            trackingNumber: shipmentRows.trackingNumber,
            trackingUrl: shipmentRows.trackingUrl,
            shippedAt: shipmentRows.shippedAt,
            deliveredAt: shipmentRows.deliveredAt,
            estimatedDeliveryAt: shipmentRows.estimatedDeliveryAt,
            trackingHistory,
          }
        : null,
      address: addressRows
        ? {
            fullName: addressRows.fullName,
            phone: addressRows.phone,
            addressLine1: addressRows.addressLine1,
            addressLine2: addressRows.addressLine2,
            landmark: addressRows.landmark,
            city: addressRows.city,
            state: addressRows.state,
            postalCode: addressRows.postalCode,
            country: addressRows.country,
          }
        : null,
      items: formattedItems,
    };
  }
}
