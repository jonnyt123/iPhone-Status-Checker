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
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      logger.warn({ sessionId: session.id }, "Webhook: no orderId in session metadata");
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order) {
      logger.warn({ orderId }, "Webhook: order not found");
      return;
    }

    if (order.paymentStatus === "paid") {
      logger.info({ orderId }, "Webhook: order already paid (idempotent)");
      return;
    }

    await db
      .update(ordersTable)
      .set({
        paymentStatus: "paid",
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
      },
    });

    logger.info({ orderId }, "Payment confirmed — starting provider check");

    const identifier = decrypt(order.identifierEncrypted);
    logger.info(
      { orderId, imeiSuffix: identifier.slice(-4), identifierType: order.identifierType },
      "Webhook: decrypted identifier for provider call"
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

      logger.info({ orderId }, "Provider check completed — sending result email");

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
          activationLockStatus: result.activationLockStatus,
          findMyStatus: result.findMyStatus,
          providerCoverageNotes: result.providerCoverageNotes,
        });

        await db.insert(auditLogsTable).values({
          orderId,
          eventType: "result_email_sent",
          eventPayload: { email: order.email },
        });
      } catch (emailErr) {
        logger.error({ emailErr, orderId }, "Failed to send result email — provider check succeeded but email failed");
        await db.insert(auditLogsTable).values({
          orderId,
          eventType: "result_email_failed",
          eventPayload: { email: order.email, error: String(emailErr) },
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ err, orderId, msg }, "Provider check FAILED — storing failure diagnostics");

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
  }
}

router.post(
  "/stripe/webhook",
  async (req: Request, res: Response): Promise<void> => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret) {
      const sig = req.headers["stripe-signature"];
      if (!sig || typeof sig !== "string") {
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
      } catch (err) {
        logger.error({ err }, "Stripe webhook signature verification failed");
        res.status(400).json({ error: "Webhook signature verification failed" });
        return;
      }
    } else {
      logger.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
      event = req.body as Stripe.Event;
    }

    res.json({ received: true });

    processWebhookEvent(event).catch((err) => {
      logger.error({ err, eventType: event.type }, "Error processing webhook event");
    });
  }
);

export default router;
