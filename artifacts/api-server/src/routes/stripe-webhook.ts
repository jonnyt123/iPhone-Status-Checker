import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, auditLogsTable } from "@workspace/db";
import { getUncachableStripeClient } from "../lib/stripe";
import { runProviderCheck } from "../lib/provider";
import { sendResultEmail } from "../lib/email";
import { logger } from "../lib/logger";
import { decrypt } from "../lib/crypto";
import type Stripe from "stripe";

const router: IRouter = Router();

async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  const objectType = (event.data.object as { object?: string }).object ?? "unknown";
  logger.info(
    { eventType: event.type, eventId: event.id, objectType },
    "Webhook: processing event — type=%s objectType=%s",
    event.type,
    objectType
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    logger.info(
      {
        sessionId: session.id,
        orderId: orderId ?? "(missing)",
        paymentStatus: session.payment_status,
        paymentIntent: session.payment_intent ?? "(none)",
        stripeObjectType: "checkout.session",
      },
      "Webhook: checkout.session.completed received — orderId=%s paymentStatus=%s",
      orderId ?? "(missing)",
      session.payment_status
    );

    if (!orderId) {
      logger.warn({ sessionId: session.id }, "Webhook: no orderId in session metadata — cannot process");
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order) {
      logger.warn({ orderId }, "Webhook: order not found in database");
      return;
    }

    if (order.paymentStatus === "paid") {
      logger.info({ orderId }, "Webhook: order already paid — skipping (idempotent)");
      return;
    }

    logger.info({ orderId }, "Webhook: marking order paid and setting webhookReceived=true");

    await db
      .update(ordersTable)
      .set({
        paymentStatus: "paid",
        webhookReceived: true,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        checkStatus: "in_progress",
      })
      .where(eq(ordersTable.id, orderId));

    await db.insert(auditLogsTable).values({
      orderId,
      eventType: "payment_completed",
      eventPayload: {
        sessionId: session.id,
        paymentIntent: session.payment_intent,
        stripeObjectType: "checkout.session",
        paymentStatus: session.payment_status,
      },
    });

    const identifier = decrypt(order.identifierEncrypted);
    logger.info(
      {
        orderId,
        imeiSuffix: identifier.slice(-4),
        identifierType: order.identifierType,
      },
      "Webhook: starting provider check — imeiSuffix=...%s",
      identifier.slice(-4)
    );

    await db.insert(auditLogsTable).values({
      orderId,
      eventType: "provider_check_started",
      eventPayload: {
        identifierType: order.identifierType,
        imeiSuffix: identifier.slice(-4),
        providerUrl: "https://www.imeiapi.org/checkimei/",
      },
    });

    try {
      const { normalized: result, meta } = await runProviderCheck(
        identifier,
        order.identifierType,
        order.identifierMasked
      );

      logger.info(
        {
          orderId,
          providerCalled: meta.providerCalled,
          providerHttpStatus: meta.providerHttpStatus,
          providerResponseReceived: meta.providerResponseReceived,
          blacklistStatus: result.blacklistStatus,
        },
        "Webhook: provider check completed — httpStatus=%s blacklist=%s",
        meta.providerHttpStatus ?? "(none)",
        result.blacklistStatus ?? "(none)"
      );

      await db
        .update(ordersTable)
        .set({
          checkStatus: "completed",
          providerName: result.providerName,
          brand: result.brand,
          model: result.model,
          manufacturer: result.manufacturer,
          blacklistStatus: result.blacklistStatus,
          activationLockStatus: result.activationLockStatus,
          findMyStatus: result.findMyStatus,
          providerCoverageNotes: result.providerCoverageNotes,
          rawProviderResponseEncrypted: result.rawProviderResponseEncrypted,
          checkedAt: result.checkedAt,
          providerCalled: meta.providerCalled,
          providerHttpStatus: meta.providerHttpStatus,
          providerResponseReceived: meta.providerResponseReceived,
          providerErrorMessage: meta.providerErrorMessage,
        })
        .where(eq(ordersTable.id, orderId));

      await db.insert(auditLogsTable).values({
        orderId,
        eventType: "provider_check_completed",
        eventPayload: {
          providerName: result.providerName,
          httpStatus: meta.providerHttpStatus,
          blacklistStatus: result.blacklistStatus,
          activationLockStatus: result.activationLockStatus,
          findMyStatus: result.findMyStatus,
        },
      });

      logger.info({ orderId, email: order.email }, "Webhook: starting result email send");

      try {
        await sendResultEmail({
          orderId,
          email: order.email,
          checkedAt: result.checkedAt,
          identifierMasked: order.identifierMasked,
          identifierType: order.identifierType,
          providerName: result.providerName,
          brand: result.brand,
          model: result.model,
          manufacturer: result.manufacturer,
          blacklistStatus: result.blacklistStatus,
          providerCoverageNotes: result.providerCoverageNotes,
        });

        await db
          .update(ordersTable)
          .set({ emailSent: true })
          .where(eq(ordersTable.id, orderId));

        await db.insert(auditLogsTable).values({
          orderId,
          eventType: "result_email_sent",
          eventPayload: { email: order.email },
        });

        logger.info({ orderId, email: order.email }, "Webhook: result email sent successfully");
      } catch (emailErr) {
        logger.error(
          { emailErr, orderId, email: order.email },
          "Webhook: email send FAILED — provider check succeeded but email failed"
        );
        await db.insert(auditLogsTable).values({
          orderId,
          eventType: "result_email_failed",
          eventPayload: { email: order.email, error: String(emailErr) },
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(
        { err, orderId, msg },
        "Webhook: provider check FAILED — storing failure diagnostics"
      );

      let providerHttpStatus: number | null = null;
      if (msg.includes("HTTP ")) {
        const match = msg.match(/HTTP (\d{3})/);
        if (match) providerHttpStatus = parseInt(match[1], 10);
      }

      await db
        .update(ordersTable)
        .set({
          checkStatus: "failed",
          providerCalled: true,
          providerHttpStatus,
          providerResponseReceived: false,
          providerErrorMessage: msg.slice(0, 1000),
        })
        .where(eq(ordersTable.id, orderId));

      await db.insert(auditLogsTable).values({
        orderId,
        eventType: "provider_check_failed",
        eventPayload: {
          error: msg,
          httpStatus: providerHttpStatus,
        },
      });
    }
  } else {
    logger.info(
      { eventType: event.type, objectType },
      "Webhook: received unhandled event type=%s — ignoring",
      event.type
    );
  }
}

router.post(
  "/stripe/webhook",
  async (req: Request, res: Response): Promise<void> => {
    logger.info(
      { contentType: req.headers["content-type"], hasSignature: !!req.headers["stripe-signature"] },
      "Webhook endpoint hit"
    );

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret) {
      const sig = req.headers["stripe-signature"];
      if (!sig || typeof sig !== "string") {
        logger.warn("Webhook: missing stripe-signature header — rejecting");
        res.status(400).json({ error: "Missing stripe-signature header" });
        return;
      }

      try {
        const stripe = await getUncachableStripeClient();
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          sig,
          webhookSecret
        );
        logger.info({ eventType: event.type, eventId: event.id }, "Webhook: signature verified OK");
      } catch (err) {
        logger.error({ err }, "Webhook: signature verification FAILED");
        res.status(400).json({ error: "Webhook signature verification failed" });
        return;
      }
    } else {
      logger.warn("Webhook: STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev mode)");
      event = req.body as Stripe.Event;
    }

    res.json({ received: true });

    processWebhookEvent(event).catch((err) => {
      logger.error({ err, eventType: event.type }, "Webhook: unhandled error in processWebhookEvent");
    });
  }
);

export default router;
