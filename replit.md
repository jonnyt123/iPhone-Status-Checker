# iPhone Check

## Overview

A production-ready paid web service where customers enter their email + IMEI number, pay $0.99 CAD plus applicable GST/HST via Stripe, and receive their iPhone blacklist check results on-screen and by email (via Resend). Blacklist-check only — no Activation Lock or Find My checks.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/imei-check) at path `/`
- **API framework**: Express 5 (artifacts/api-server) at path `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Payments**: Stripe Checkout (via Replit connector — no manual API key needed)
- **Email**: Resend (`RESEND_API_KEY` secret)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Encryption**: AES-256-GCM (Node crypto) for IMEI/serial storage

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables / Secrets Required

- `SESSION_SECRET` — used for session encryption and IMEI AES-256-GCM encryption (already set)
- `DATABASE_URL` — PostgreSQL connection (already set by Replit)
- `RESEND_API_KEY` — Resend email API key
- `FROM_EMAIL` — verified sender email for Resend
- `SUPPORT_EMAIL` — support contact email shown to customers
- `ADMIN_EMAIL` — admin dashboard login email
- `ADMIN_PASSWORD` — admin dashboard login password
- `STRIPE_WEBHOOK_SECRET` — (optional) Stripe webhook signing secret for production security
- `IMEIAPI_KEY` — IMEI provider API key for imeiapi.org (required for real checks)
- `IMEIAPI_SUPPORTS_SERIAL` — set to `true` to allow serial number lookups (default: false)
- `PROVIDER_NAME` — display name for the provider shown in results
- `MOCK_PROVIDER` — set to `true` to use mock provider (for testing without a real provider). Also activates automatically if IMEIAPI_KEY is not set.
- `APP_BASE_URL` — production base URL (auto-detected if not set)

## Architecture

### User Flow
1. User lands on homepage → clicks "Start Check"
2. 3-step form: email → IMEI → price ($0.99 CAD) → Stripe Checkout
3. Stripe payment completes → webhook fires → provider check runs → email sent
4. User sees success screen ("check your email")

### Provider Adapter (`artifacts/api-server/src/lib/provider.ts`)
- POSTs to `https://www.imeiapi.org/checkimei/` with `multipart/form-data` (fields: `key`, `imei`)
- Returns `ProviderCheckResult { normalized, meta }` where meta tracks diagnostic info
- Maps only fields actually returned by the provider — missing fields → "unavailable" (never inferred)
- Logs request start, HTTP status, and sanitized response body
- Fails loudly (logs ERROR) when IMEIAPI_KEY is missing, auth fails (401/403), or quota exceeded (429)
- Mock mode when `MOCK_PROVIDER=true` or `IMEIAPI_KEY` is not set (logs warning)
- Provider diagnostics stored per order: `providerCalled`, `providerHttpStatus`, `providerResponseReceived`, `providerErrorMessage`

### Stripe Integration
- Uses Replit connector — no manual Stripe keys needed in development
- Webhook at `/api/stripe/webhook` — set this URL in your Stripe dashboard
- Idempotent webhook processing (checks if already paid before processing)
- For production webhook verification, set `STRIPE_WEBHOOK_SECRET`

### Email (Resend)
- Sends result emails after payment + provider check
- If `RESEND_API_KEY` or `FROM_EMAIL` not set, email is skipped (logged as warning)
- Note: SendGrid integration was dismissed — using Resend API key directly instead

### Security
- IMEI/serial numbers are AES-256-GCM encrypted at rest (key derived from SESSION_SECRET)
- Only masked identifiers are shown in logs, emails, and admin UI
- Admin auth via session cookie (express-session)
- Stripe webhook signature verified (when STRIPE_WEBHOOK_SECRET is set)
- Rate limiting: 5 orders per IP per minute, 5 per email per minute (in-memory)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — headline, CTA, notices |
| `/order` | 3-step order form |
| `/success` | Payment success |
| `/cancel` | Payment cancelled |
| `/results/:orderId` | Order results (after payment) |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |
| `/refunds` | Refund policy |
| `/contact` | Contact/support |
| `/admin` | Admin login |
| `/admin/dashboard` | Admin dashboard (stats + orders) |
| `/admin/orders/:id` | Admin order detail + audit log |

## Database Tables

- `orders` — all orders with encrypted identifier, payment/check status, result fields, and provider diagnostics (`providerCalled`, `providerHttpStatus`, `providerResponseReceived`, `providerErrorMessage`)
- `audit_logs` — event log per order: `order_created`, `payment_completed`, `provider_check_started`, `provider_check_completed`, `provider_check_failed`, `result_email_sent`, `result_email_failed`, `admin_resend_email`, `admin_marked_refund_review`

## Admin Features

- **Order detail page** — payment info, device info, provider diagnostics, order timeline, raw audit log
- **Order timeline** — visual step tracker: Order Created → Payment Confirmed → Provider Called → Results Saved → Email Sent
- **Provider diagnostics card** — shows: provider called (yes/no), HTTP status, response received (yes/no), error message
- **Test Provider button** — admin can enter any IMEI and run a live provider check; shows raw normalized result and meta diagnostics
- **Admin endpoint** `POST /api/admin/test-provider` — requires admin auth, body `{ imei: string }`

## Stripe Webhook Setup (Production)

1. In your Stripe dashboard, add a webhook endpoint: `https://your-app.replit.app/api/stripe/webhook`
2. Subscribe to event: `checkout.session.completed`
3. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET`
