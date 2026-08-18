import { db } from "@/db/client";
import { orders, orderItems, payments, customers, products, coupons } from "@/db/schema";
import { eq, gte, lte, and, sql, count, desc, sum, inArray } from "drizzle-orm";

// Valid order statuses that represent confirmed revenue / valid completed sales
const VALID_REVENUE_STATUSES: Array<"confirmed" | "processing" | "packed" | "shipped" | "out_for_delivery" | "delivered"> = [
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export class AnalyticsRepository {
  /**
   * Get overall overview statistics filtered by time range (today, 7d, 30d, year)
   */
  static async getOverviewStats(range: "today" | "7d" | "30d" | "year" = "30d") {
    const now = new Date();
    let startDate = new Date();

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "30d") {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "year") {
      startDate.setFullYear(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
    }

    // 1. Total Revenue in Range (Filtered by Valid Completed/Paid Orders)
    const paidOrders = await db
      .select({
        totalRevenue: sum(orders.total),
        orderCount: count(orders.id),
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate),
          inArray(orders.status, VALID_REVENUE_STATUSES)
        )
      );

    // 2. Revenue Today (Filtered by Valid Orders)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const revenueToday = await db
      .select({ totalRevenue: sum(orders.total) })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, todayStart),
          inArray(orders.status, VALID_REVENUE_STATUSES)
        )
      );

    // 3. Revenue This Month (Filtered by Valid Orders)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueMonth = await db
      .select({ totalRevenue: sum(orders.total) })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, monthStart),
          inArray(orders.status, VALID_REVENUE_STATUSES)
        )
      );

    // 4. Order Counts by Status (SQL Conditional Aggregation)
    const [orderCountsRow, totalCustomersRow, totalProductsRow, activeCouponsRow] = await Promise.all([
      db.select({
        totalOrders: count(orders.id),
        pendingOrders: sql<number>`COUNT(CASE WHEN ${orders.status} = 'pending' THEN 1 END)`,
        completedOrders: sql<number>`COUNT(CASE WHEN ${orders.status} = 'delivered' THEN 1 END)`,
      }).from(orders),
      db.select({ total: count() }).from(customers),
      db.select({ total: count() }).from(products).where(eq(products.isActive, true)),
      db.select({ total: count() }).from(coupons).where(eq(coupons.isActive, true)),
    ]);

    return {
      totalRevenue: Number(paidOrders[0]?.totalRevenue || 0),
      revenueToday: Number(revenueToday[0]?.totalRevenue || 0),
      revenueThisMonth: Number(revenueMonth[0]?.totalRevenue || 0),
      totalOrders: Number(orderCountsRow[0]?.totalOrders || 0),
      pendingOrders: Number(orderCountsRow[0]?.pendingOrders || 0),
      completedOrders: Number(orderCountsRow[0]?.completedOrders || 0),
      totalCustomers: Number(totalCustomersRow[0]?.total || 0),
      totalProducts: Number(totalProductsRow[0]?.total || 0),
      activeCoupons: Number(activeCouponsRow[0]?.total || 0),
    };
  }

  /**
   * Get Sales Chart Data grouped by Date / Month based on range
   */
  static async getSalesChartTrend(range: "today" | "7d" | "30d" | "year" = "30d") {
    const now = new Date();
    let startDate = new Date();

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "30d") {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "year") {
      startDate.setFullYear(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
    }

    // Query sales grouped by date format
    const rows = await db
      .select({
        date: sql<string>`DATE_TRUNC('day', ${orders.createdAt})::date::text`,
        revenue: sum(orders.total),
        orderCount: count(orders.id),
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate),
          inArray(orders.status, VALID_REVENUE_STATUSES)
        )
      )
      .groupBy(sql`DATE_TRUNC('day', ${orders.createdAt})::date`)
      .orderBy(sql`DATE_TRUNC('day', ${orders.createdAt})::date`);

    return rows.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue || 0),
      orders: Number(r.orderCount || 0),
    }));
  }

  /**
   * Get Latest Orders Widget (Top N)
   */
  static async getLatestOrders(limitCount = 5) {
    const rows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: sql<string>`CONCAT(${customers.firstName}, ' ', COALESCE(${customers.lastName}, ''))`,
        customerEmail: customers.email,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt))
      .limit(limitCount);

    return rows;
  }

  /**
   * Get Recent Registered Customers (Top N)
   */
  static async getLatestCustomers(limitCount = 5) {
    return await db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt))
      .limit(limitCount);
  }

  /**
   * Get Top Selling Products (Aggregated order quantity)
   */
  static async getTopSellingProducts(limitCount = 5) {
    const rows = await db
      .select({
        productId: products.id,
        name: products.name,
        salesCount: sum(orderItems.quantity),
        revenue: sum(orderItems.totalPrice),
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(inArray(orders.status, VALID_REVENUE_STATUSES))
      .groupBy(products.id, products.name)
      .orderBy(desc(sum(orderItems.quantity)))
      .limit(limitCount);

    return rows.map((r) => ({
      productId: r.productId,
      name: r.name,
      salesCount: Number(r.salesCount || 0),
      revenue: Number(r.revenue || 0),
    }));
  }

  /**
   * Get Recent Payments Widget (Top N)
   */
  static async getRecentPayments(limitCount = 5) {
    const rows = await db
      .select({
        id: payments.id,
        orderId: payments.orderId,
        paymentMethod: payments.paymentMethod,
        status: payments.status,
        amount: payments.amount,
        gateway: payments.gateway,
        gatewayPaymentId: payments.gatewayPaymentId,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .orderBy(desc(payments.createdAt))
      .limit(limitCount);

    return rows;
  }
}
