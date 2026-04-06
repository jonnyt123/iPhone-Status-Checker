import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  identifierType: text("identifier_type").notNull().default("imei"),
  identifierEncrypted: text("identifier_encrypted").notNull(),
  identifierMasked: text("identifier_masked").notNull(),
  amount: integer("amount").notNull().default(99),
  currency: text("currency").notNull().default("CAD"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  checkStatus: text("check_status").notNull().default("pending"),
  refundReview: boolean("refund_review").notNull().default(false),
  providerName: text("provider_name"),
  brand: text("brand"),
  model: text("model"),
  manufacturer: text("manufacturer"),
  blacklistStatus: text("blacklist_status"),
  activationLockStatus: text("activation_lock_status"),
  findMyStatus: text("find_my_status"),
  providerCoverageNotes: text("provider_coverage_notes"),
  rawProviderResponseEncrypted: text("raw_provider_response_encrypted"),
  providerCalled: boolean("provider_called").notNull().default(false),
  providerHttpStatus: integer("provider_http_status"),
  providerResponseReceived: boolean("provider_response_received").notNull().default(false),
  providerErrorMessage: text("provider_error_message"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  checkedAt: timestamp("checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
