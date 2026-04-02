import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, auditLogsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  CreateCheckoutSessionParams,
  GetOrderResultsParams,
} from "@workspace/api-zod";
import { validateEmail, validateImei, validateSerial } from "../lib/validation";
import { encrypt, maskImei, maskSerial } from "../lib/crypto";
import { getUncachableStripeClient, getStripePublishableKey } from "../lib/stripe";

const router: IRouter = Router();

const AMOUNT_CAD_CENTS = 99;
const CURRENCY = "CAD";

// Rate limit storage (simple in-memory — use Redis in production)
const recentOrders = new Map<string, number[]>();

function isRateLimited(key: string, windowMs = 60000, max = 5): boolean {
  const now = Date.now();
  const times = (recentOrders.get(key) ?? []).filter((t) => now - t < windowMs);
  if (times.length >= max) return true;
  times.push(now);
  recentOrders.set(key, times);
  return false;
}

router.get("/stripe/publishable-key", async (_req, res): Promise<void> => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (err) {
    _req.log.error({ err }, "Failed to get publishable key");
    res.status(500).json({ error: "internal_error", message: "Failed to get publishable key" });
  }
});

router.post("/orders", async (req, res): Promise<void> => {
  const ip = req.ip ?? "unknown";
  const parsed = CreateOrderBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { email, identifier, identifierType = "imei" } = parsed.data;

  const emailVal = validateEmail(email);
  if (!emailVal.valid) {
    res.status(400).json({ error: "validation_error", message: emailVal.error });
    return;
  }

  if (isRateLimited(`ip:${ip}`) || isRateLimited(`email:${email.toLowerCase()}`)) {
    res.status(429).json({ error: "rate_limited", message: "Too many requests. Please try again later." });
    return;
  }

  const supportsSerial = process.env.IMEIAPI_SUPPORTS_SERIAL === "true";

  if (identifierType === "serial" && !supportsSerial) {
    res.status(400).json({
      error: "validation_error",
      message: "Serial number lookup is not supported by the configured provider.",
    });
    return;
  }

  let identifierVal;
  if (identifierType === "imei") {
    identifierVal = validateImei(identifier);
  } else {
    identifierVal = validateSerial(identifier);
  }

  if (!identifierVal.valid) {
    res.status(400).json({ error: "validation_error", message: identifierVal.error });
    return;
  }

  const cleaned = identifier.replace(/[\s\-]/g, "");
  const identifierEncrypted = encrypt(cleaned);
  const identifierMasked =
    identifierType === "imei" ? maskImei(cleaned) : maskSerial(cleaned);

  const [order] = await db
    .insert(ordersTable)
    .values({
      email,
      identifierType,
      identifierEncrypted,
      identifierMasked,
      amount: AMOUNT_CAD_CENTS,
      currency: CURRENCY,
      paymentStatus: "pending",
      checkStatus: "pending",
    })
    .returning();

  await db.insert(auditLogsTable).values({
    orderId: order.id,
    eventType: "order_created",
    eventPayload: { email, identifierType, identifierMasked },
  });

  req.log.info({ orderId: order.id }, "Order created");

  res.status(201).json({
    id: order.id,
    email: order.email,
    identifierType: order.identifierType,
    identifierMasked: order.identifierMasked,
    amount: order.amount,
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    checkStatus: order.checkStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});

router.get("/orders/:orderId", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
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
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});

router.post("/orders/:orderId/checkout", async (req, res): Promise<void> => {
  const params = CreateCheckoutSessionParams.safeParse(req.params);
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

  if (order.paymentStatus === "paid") {
    res.status(400).json({ error: "already_paid", message: "This order has already been paid" });
    return;
  }

  const baseUrl =
    process.env.APP_BASE_URL ??
    `https://${(process.env.REPLIT_DOMAINS ?? "").split(",")[0]}`;

  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Trusted IMEI Check",
              description: `Device status check for ${order.identifierMasked}`,
            },
            unit_amount: AMOUNT_CAD_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: order.email,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/cancel?order_id=${order.id}`,
      metadata: { orderId: order.id },
    });

    await db
      .update(ordersTable)
      .set({ stripeCheckoutSessionId: session.id })
      .where(eq(ordersTable.id, order.id));

    await db.insert(auditLogsTable).values({
      orderId: order.id,
      eventType: "checkout_session_created",
      eventPayload: { sessionId: session.id },
    });

    res.json({ sessionId: session.id, url: session.url ?? "" });
  } catch (err) {
    req.log.error({ err, orderId: order.id }, "Failed to create checkout session");
    res.status(500).json({ error: "stripe_error", message: "Failed to create checkout session" });
  }
});

router.get("/orders/:orderId/results", async (req, res): Promise<void> => {
  const params = GetOrderResultsParams.safeParse(req.params);
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

  if (order.paymentStatus !== "paid") {
    res.status(402).json({ error: "payment_required", message: "Payment required to view results" });
    return;
  }

  res.json({
    orderId: order.id,
    checkedAt: order.checkedAt,
    identifierType: order.identifierType,
    identifierMasked: order.identifierMasked,
    providerName: order.providerName,
    brand: order.brand,
    model: order.model,
    manufacturer: order.manufacturer,
    blacklistStatus: order.blacklistStatus,
    activationLockStatus: order.activationLockStatus,
    findMyStatus: order.findMyStatus,
    providerCoverageNotes: order.providerCoverageNotes,
    checkStatus: order.checkStatus,
    paymentStatus: order.paymentStatus,
  });
});

export default router;
