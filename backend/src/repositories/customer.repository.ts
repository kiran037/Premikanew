import { db } from "@/db/client";
import { customers, customerAddresses } from "@/db/schema/customer";
import { orders, orderItems, payments } from "@/db/schema/order";
import { eq, and, or, ilike, count, sum, max, desc, asc, inArray, gte, sql } from "drizzle-orm";

export interface CustomerQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  segment?: "all" | "vip" | "high_spender" | "returning" | "one_time" | "new";
  sortBy?: "spend_desc" | "orders_desc" | "newest" | "name_asc";
}

// Valid order statuses that represent confirmed revenue / valid completed sales
const VALID_REVENUE_STATUSES = [
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export class CustomerRepository {
  /**
   * Helper to derive dynamic tags for a customer based on completed sales
   */
  static deriveCustomerTags(cust: {
    createdAt: Date;
    totalOrders: number;
    lifetimeSpend: number;
  }): string[] {
    const tags: string[] = [];

    const isNew = Date.now() - new Date(cust.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
    if (isNew) tags.push("New Customer");

    if (cust.lifetimeSpend >= 10000 || cust.totalOrders >= 3) {
      tags.push("VIP Customer");
    } else if (cust.lifetimeSpend >= 5000) {
      tags.push("High Spender");
    }

    if (cust.totalOrders >= 2) {
      tags.push("Returning Customer");
    } else if (cust.totalOrders === 1) {
      tags.push("One-Time Buyer");
    }

    return tags;
  }

  /**
   * Admin: Search, filter, sort, and paginate customers with CRM metrics
   */
  static async getAdminCustomers(options: CustomerQueryOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.search) {
      const term = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(customers.firstName, term),
          ilike(customers.lastName, term),
          ilike(customers.email, term),
          ilike(customers.phone, term)
        )!
      );
    }

    if (options.segment === "new") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      conditions.push(gte(customers.createdAt, sevenDaysAgo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // SQL Expression for confirmed/valid sales metrics
    const totalOrdersExpr = sql<number>`COALESCE(COUNT(DISTINCT CASE WHEN ${orders.status} IN ('confirmed','processing','packed','shipped','out_for_delivery','delivered') THEN ${orders.id} END), 0)`;
    const lifetimeSpendExpr = sql<number>`COALESCE(SUM(CASE WHEN ${orders.status} IN ('confirmed','processing','packed','shipped','out_for_delivery','delivered') THEN ${orders.total} ELSE 0 END), 0)`;
    const lastOrderDateExpr = sql<Date | null>`MAX(${orders.createdAt})`;

    const havingConditions = [];
    if (options.segment === "vip") {
      havingConditions.push(sql`(${lifetimeSpendExpr} >= 10000 OR ${totalOrdersExpr} >= 3)`);
    } else if (options.segment === "high_spender") {
      havingConditions.push(sql`(${lifetimeSpendExpr} >= 5000 AND ${lifetimeSpendExpr} < 10000 AND ${totalOrdersExpr} < 3)`);
    } else if (options.segment === "returning") {
      havingConditions.push(sql`(${totalOrdersExpr} >= 2)`);
    } else if (options.segment === "one_time") {
      havingConditions.push(sql`(${totalOrdersExpr} = 1)`);
    }

    const havingClause = havingConditions.length > 0 ? and(...havingConditions) : undefined;

    let orderByClause;
    if (options.sortBy === "spend_desc") {
      orderByClause = desc(lifetimeSpendExpr);
    } else if (options.sortBy === "orders_desc") {
      orderByClause = desc(totalOrdersExpr);
    } else if (options.sortBy === "name_asc") {
      orderByClause = asc(customers.firstName);
    } else {
      orderByClause = desc(customers.createdAt);
    }

    // 1. Fetch Paginated Customers with Aggregated Metrics
    const customerRows = await db
      .select({
        customer: customers,
        totalOrders: totalOrdersExpr,
        lifetimeSpend: lifetimeSpendExpr,
        lastOrderDate: lastOrderDateExpr,
      })
      .from(customers)
      .leftJoin(orders, eq(customers.id, orders.customerId))
      .where(whereClause)
      .groupBy(customers.id)
      .having(havingClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // 2. Fetch Total Count for Pagination
    let totalCount = 0;
    if (havingClause) {
      const countRes = await db
        .select({ id: customers.id })
        .from(customers)
        .leftJoin(orders, eq(customers.id, orders.customerId))
        .where(whereClause)
        .groupBy(customers.id)
        .having(havingClause);
      totalCount = countRes.length;
    } else {
      const countRes = await db
        .select({ count: count() })
        .from(customers)
        .where(whereClause);
      totalCount = Number(countRes[0]?.count || 0);
    }

    if (customerRows.length === 0) {
      return {
        items: [],
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      };
    }

    // Fetch latest order status for the paginated subset only
    const pageCustomerIds = customerRows.map((r) => r.customer.id);
    const latestOrdersMap = new Map<string, string>();

    if (pageCustomerIds.length > 0) {
      const latestOrderRows = await db
        .select({
          customerId: orders.customerId,
          status: orders.status,
        })
        .from(orders)
        .where(inArray(orders.customerId, pageCustomerIds))
        .orderBy(desc(orders.createdAt));

      latestOrderRows.forEach((row) => {
        if (!latestOrdersMap.has(row.customerId)) {
          latestOrdersMap.set(row.customerId, row.status);
        }
      });
    }

    const items = customerRows.map((row) => {
      const cust = row.customer;
      const totalOrd = Number(row.totalOrders || 0);
      const spend = Number(row.lifetimeSpend || 0);
      const fullName = `${cust.firstName} ${cust.lastName || ""}`.trim();
      const aov = totalOrd > 0 ? Math.round(spend / totalOrd) : 0;
      const lastOrdDate = row.lastOrderDate ? new Date(row.lastOrderDate) : null;
      const latestStatus = latestOrdersMap.get(cust.id) || null;

      const tags = CustomerRepository.deriveCustomerTags({
        createdAt: cust.createdAt,
        totalOrders: totalOrd,
        lifetimeSpend: spend,
      });

      return {
        id: cust.id,
        name: fullName,
        email: cust.email,
        phone: cust.phone || "N/A",
        totalOrders: totalOrd,
        lifetimeSpend: spend,
        aov,
        lastOrderDate: lastOrdDate,
        latestOrderStatus: latestStatus,
        createdAt: cust.createdAt,
        tags,
      };
    });

    return {
      items,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  /**
   * Admin: Find single customer CRM details by ID with address book, full orders history, payment transactions, and analytics
   */
  static async findAdminCustomerById(id: string) {
    const customerRecord = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .then((r) => r[0] || null);

    if (!customerRecord) return null;

    const [addresses, customerOrders] = await Promise.all([
      db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customerRecord.id))
        .orderBy(desc(customerAddresses.isDefault)),
      db
        .select()
        .from(orders)
        .where(eq(orders.customerId, customerRecord.id))
        .orderBy(desc(orders.createdAt)),
    ]);

    const orderIds = customerOrders.map((o) => o.id);

    // Filter valid sales orders for analytics calculations
    const validSalesOrders = customerOrders.filter((o) =>
      (VALID_REVENUE_STATUSES as readonly string[]).includes(o.status)
    );
    const validOrderIdsSet = new Set(validSalesOrders.map((o) => o.id));

    let customerPayments: any[] = [];
    let itemsCountMap = new Map<string, number>();
    let topProductsMap = new Map<string, { name: string; qty: number }>();

    if (orderIds.length > 0) {
      const [payRows, itemRows] = await Promise.all([
        db.select().from(payments).where(inArray(payments.orderId, orderIds)).orderBy(desc(payments.createdAt)),
        db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)),
      ]);

      customerPayments = payRows;

      itemRows.forEach((item) => {
        itemsCountMap.set(item.orderId, (itemsCountMap.get(item.orderId) || 0) + item.quantity);

        // Only include items from valid completed sales in Top Products
        if (validOrderIdsSet.has(item.orderId)) {
          const prod = topProductsMap.get(item.productId);
          if (!prod) {
            topProductsMap.set(item.productId, { name: item.productName, qty: item.quantity });
          } else {
            prod.qty += item.quantity;
          }
        }
      });
    }

    const enrichedOrders = customerOrders.map((o) => ({
      ...o,
      itemCount: itemsCountMap.get(o.id) || 0,
    }));

    // Calculate Customer Analytics (Strictly from Valid Completed Sales)
    const totalOrders = validSalesOrders.length;
    const lifetimeSpend = validSalesOrders.reduce((sum, o) => sum + o.total, 0);
    const aov = totalOrders > 0 ? Math.round(lifetimeSpend / totalOrders) : 0;
    const firstOrderDate = totalOrders > 0 ? validSalesOrders[validSalesOrders.length - 1].createdAt : null;
    const lastOrderDate = totalOrders > 0 ? validSalesOrders[0].createdAt : null;
    const largestOrder = totalOrders > 0 ? [...validSalesOrders].sort((a, b) => b.total - a.total)[0] : null;

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const tags = CustomerRepository.deriveCustomerTags({
      createdAt: customerRecord.createdAt,
      totalOrders,
      lifetimeSpend,
    });

    return {
      customer: {
        id: customerRecord.id,
        firstName: customerRecord.firstName,
        lastName: customerRecord.lastName,
        name: `${customerRecord.firstName} ${customerRecord.lastName || ""}`.trim(),
        email: customerRecord.email,
        phone: customerRecord.phone || "N/A",
        isActive: customerRecord.isActive,
        createdAt: customerRecord.createdAt,
        tags,
      },
      analytics: {
        lifetimeSpend,
        totalOrders,
        aov,
        firstOrderDate,
        lastOrderDate,
        largestOrder,
        topProducts,
      },
      addresses,
      orders: enrichedOrders,
      payments: customerPayments,
    };
  }
}
