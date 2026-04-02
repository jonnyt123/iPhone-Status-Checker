import { Router, type IRouter } from "express";
import { eq, ilike, or, desc, count, sql } from "drizzle-orm";
import { db, ordersTable, auditLogsTable } from "@workspace/db";
import {
  ListAdminOrdersQueryParams,
  GetAdminOrderParams,
  AdminResendEmailParams,
  AdminMarkRefundReviewParams,
  GetAuditLogsParams,
  AdminLoginBody,
} from "@workspace/api-zod";
import { runProviderCheck } from "../lib/provider";
import { sendResultEmail } from "../lib/email";
import { decrypt } from "../lib/crypto";
import type { Request, Response } from "express";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
  if (!req.session?.adminAuthenticated) {
    res.status(401).json({ error: "unauthorized", message: "Admin authentication required" });
    return false;
  }
  return true;
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    res.status(500).json({ error: "config_error", message: "Admin credentials not configured" });
    return;
  }

  if (email !== adminEmail || password !== adminPassword) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    return;
  }

  req.session.adminAuthenticated = true;
  req.session.adminEmail = email;
  res.json({ email, authenticated: true });
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  if (!req.session?.adminAuthenticated) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  res.json({ email: req.session.adminEmail ?? "", authenticated: true });
});

router.get("/admin/orders", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = ListAdminOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: "validation_error", message: params.error.message });
    return;
  }

  const { page = 1, limit = 20, search, paymentStatus, checkStatus } = params.data;
  const offset = (page - 1) * limit;

  let query = db.select().from(ordersTable);
  let countQuery = db.select({ count: count() }).from(ordersTable);

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(ordersTable.email, `%${search}%`),
        ilike(ordersTable.id, `%${search}%`),
        ilike(ordersTable.identifierMasked, `%${search}%`)
      )
    );
  }
  if (paymentStatus) {
    conditions.push(eq(ordersTable.paymentStatus, paymentStatus));
  }
  if (checkStatus) {
    conditions.push(eq(ordersTable.checkStatus, checkStatus));
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(conditions.length > 0 ? or(...conditions) : undefined)
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(conditions.length > 0 ? or(...conditions) : undefined);

  res.json({
    orders: orders.map((o) => ({
      id: o.id,
      email: o.email,
      identifierType: o.identifierType,
      identifierMasked: o.identifierMasked,
      amount: o.amount,
      currency: o.currency,
      paymentStatus: o.paymentStatus,
      checkStatus: o.checkStatus,
      blacklistStatus: o.blacklistStatus,
      providerName: o.providerName,
      refundReview: o.refundReview,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
    total: Number(total),
    page,
    limit,
  });
});

router.get("/admin/orders/:orderId", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = GetAdminOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid order ID" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.orderId));

  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  res.json({
    id: order.id,
    email: order.email,
    identifierType: order.identifierType,
    identifierMasked: order.identifierMasked,
    amount: order.amount,
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    checkStatus: order.checkStatus,
    blacklistStatus: order.blacklistStatus,
    activationLockStatus: order.activationLockStatus,
    findMyStatus: order.findMyStatus,
    providerName: order.providerName,
    providerCoverageNotes: order.providerCoverageNotes,
    brand: order.brand,
    model: order.model,
    manufacturer: order.manufacturer,
    refundReview: order.refundReview,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    checkedAt: order.checkedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});

router.post("/admin/orders/:orderId/resend-email", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = AdminResendEmailParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid order ID" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.orderId));

  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  try {
    await sendResultEmail({
      orderId: order.id,
      email: order.email,
      checkedAt: order.checkedAt,
      identifierMasked: order.identifierMasked,
      identifierType: order.identifierType,
      providerName: order.providerName,
      brand: order.brand,
      model: order.model,
      manufacturer: order.manufacturer,
      blacklistStatus: order.blacklistStatus,
      activationLockStatus: order.activationLockStatus,
      findMyStatus: order.findMyStatus,
      providerCoverageNotes: order.providerCoverageNotes,
    });

    await db.insert(auditLogsTable).values({
      orderId: order.id,
      eventType: "admin_resend_email",
      eventPayload: { adminEmail: req.session?.adminEmail },
    });

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err, orderId: order.id }, "Failed to resend email");
    res.status(500).json({ error: "email_error", message: "Failed to send email" });
  }
});

router.post("/admin/orders/:orderId/mark-refund-review", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = AdminMarkRefundReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid order ID" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.orderId));

  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  await db
    .update(ordersTable)
    .set({ refundReview: true })
    .where(eq(ordersTable.id, params.data.orderId));

  await db.insert(auditLogsTable).values({
    orderId: order.id,
    eventType: "admin_marked_refund_review",
    eventPayload: { adminEmail: req.session?.adminEmail },
  });

  res.json({ success: true });
});

router.get("/admin/stats", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const [totals] = await db
    .select({
      totalOrders: count(),
      paidOrders: sql<number>`count(*) filter (where payment_status = 'paid')`,
      completedChecks: sql<number>`count(*) filter (where check_status = 'completed')`,
      failedChecks: sql<number>`count(*) filter (where check_status = 'failed')`,
      pendingPayment: sql<number>`count(*) filter (where payment_status = 'pending')`,
      refundReview: sql<number>`count(*) filter (where refund_review = true)`,
      revenueCAD: sql<number>`coalesce(sum(amount) filter (where payment_status = 'paid'), 0) / 100.0`,
      ordersToday: sql<number>`count(*) filter (where created_at >= current_date)`,
    })
    .from(ordersTable);

  const statusRows = await db
    .select({
      status: ordersTable.paymentStatus,
      count: count(),
    })
    .from(ordersTable)
    .groupBy(ordersTable.paymentStatus);

  res.json({
    totalOrders: Number(totals.totalOrders),
    paidOrders: Number(totals.paidOrders),
    completedChecks: Number(totals.completedChecks),
    failedChecks: Number(totals.failedChecks),
    pendingPayment: Number(totals.pendingPayment),
    refundReview: Number(totals.refundReview),
    revenueCAD: Number(totals.revenueCAD),
    ordersToday: Number(totals.ordersToday),
    ordersByStatus: statusRows.map((r) => ({ status: r.status, count: Number(r.count) })),
  });
});

router.get("/admin/audit-logs/:orderId", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = GetAuditLogsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid order ID" });
    return;
  }

  const logs = await db
    .select()
    .from(auditLogsTable)
    .where(eq(auditLogsTable.orderId, params.data.orderId))
    .orderBy(desc(auditLogsTable.createdAt));

  res.json({
    logs: logs.map((l) => ({
      id: l.id,
      orderId: l.orderId,
      eventType: l.eventType,
      eventPayload: l.eventPayload,
      createdAt: l.createdAt,
    })),
  });
});

export default router;
