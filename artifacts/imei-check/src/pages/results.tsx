import { useGetOrderResults, getGetOrderResultsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, AlertCircle, CheckCircle2, Loader2, Smartphone,
  FileText, Activity, Server, Hash, Check, X, Minus, Info,
  Mail, CreditCard, Circle, Lock, ArrowRight,
} from "lucide-react";

const PROCESSING_STEPS = [
  { key: "order_created", label: "Order created", icon: FileText },
  { key: "payment_confirmed", label: "Payment confirmed", icon: CreditCard },
  { key: "running_check", label: "Running device check", icon: Activity },
  { key: "provider_response", label: "Provider response received", icon: Server },
  { key: "preparing_receipt", label: "Preparing your results", icon: FileText },
  { key: "email_sent", label: "Email sent", icon: Mail },
] as const;

function getActiveStep(paymentStatus: string, checkStatus: string): number {
  if (paymentStatus === "pending") return 1;
  if (checkStatus === "pending") return 1;
  if (checkStatus === "in_progress") return 2;
  if (checkStatus === "completed") return 5;
  return 1;
}

export default function Results() {
  const { orderId } = useParams();
  const isNewPayment = new URLSearchParams(window.location.search).has("new");

  const { data: results, isLoading, error, refetch } = useGetOrderResults(orderId || "", {
    query: {
      enabled: !!orderId,
      queryKey: getGetOrderResultsQueryKey(orderId || ""),
      retry: false,
    },
  });

  const awaitingPayment = results?.paymentStatus === "pending";
  const isProcessing =
    results?.paymentStatus === "paid" &&
    results.checkStatus !== "completed" &&
    results.checkStatus !== "failed";

  const shouldPoll = awaitingPayment || isProcessing;

  useEffect(() => {
    if (!shouldPoll) return;
    const timer = setInterval(() => {
      void refetch();
    }, 4000);
    return () => clearInterval(timer);
  }, [shouldPoll, refetch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-muted animate-pulse" />
            <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground font-medium">Retrieving your receipt…</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-16 px-4">
          <div className="bg-destructive/5 border border-destructive/20 rounded-[2rem] p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Report Unavailable</h2>
            <p className="text-muted-foreground text-lg" data-testid="text-results-error">
              We could not fetch this report. The link may be invalid.
            </p>
            <Link href="/order">
              <Button className="mt-4 rounded-full px-8">
                Start a New Check <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!results) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-16 px-4">
          <div className="bg-muted border rounded-[2rem] p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold">No Results Found</h2>
            <p className="text-muted-foreground">The requested report could not be located.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (awaitingPayment || isProcessing) {
    const activeStep = getActiveStep(results.paymentStatus, results.checkStatus ?? "pending");
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-16 px-4 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-4">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {awaitingPayment ? "Confirming Payment…" : "Processing Your Check"}
            </h1>
            <p className="text-muted-foreground">
              Order #{results.orderId.split("-")[0]}
              {isProcessing && " · Payment confirmed"}
            </p>
          </div>

          <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
            <ol className="relative border-l border-border ml-3 space-y-6">
              {PROCESSING_STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i < activeStep;
                const active = i === activeStep;
                return (
                  <li key={step.key} className="ml-6">
                    <span
                      className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full border-2 ${
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : active
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {done ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : active ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 opacity-30" />
                      )}
                    </span>
                    <p
                      className={`text-sm font-medium ${
                        done
                          ? "text-foreground"
                          : active
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                      {active && "…"}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            This page refreshes automatically. Your results will appear here once processing is complete and a copy will be sent to your email.
          </p>
        </div>
      </Layout>
    );
  }

  if (results.checkStatus === "failed") {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-16 px-4">
          <div className="bg-destructive/5 border border-destructive/20 rounded-[2rem] p-10 text-center space-y-5">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Check Failed</h2>
            <p className="text-sm font-medium text-muted-foreground">
              Payment received · Order #{results.orderId.split("-")[0]}
            </p>
            <p className="text-muted-foreground text-base" data-testid="text-results-error">
              We were unable to complete the device check. Your payment has been recorded. Please contact support and we will resolve this promptly.
            </p>
            <p className="text-sm font-medium text-muted-foreground">support@trustedimei.com</p>
            <Link href="/order">
              <Button variant="outline" className="rounded-full px-8 mt-2">
                Start a New Check <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string | null | undefined, type: "blacklist" | "activation") => {
    if (!status || status === "unavailable") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
          <Minus className="w-4 h-4" /> Unavailable from provider
        </span>
      );
    }
    if (type === "blacklist") {
      if (status === "clear") {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-success/15 text-success">
            <Check className="w-4 h-4" /> Clear
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-destructive/15 text-destructive">
          <X className="w-4 h-4" /> Blacklisted
        </span>
      );
    }
    if (status === "off") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-success/15 text-success">
          <Check className="w-4 h-4" /> Off
        </span>
      );
    }
    if (status === "on") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-warning/15 text-warning">
          <AlertCircle className="w-4 h-4" /> On
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-destructive/15 text-destructive">
        <X className="w-4 h-4" /> Error
      </span>
    );
  };

  const StatusRow = ({
    label, status, type, icon: Icon, testId,
  }: { label: string; status: string | null | undefined; type: "blacklist" | "activation"; icon: any; testId: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b last:border-0 gap-3">
      <div className="flex items-center gap-3 text-foreground">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="font-semibold text-lg">{label}</span>
      </div>
      <div data-testid={testId}>{getStatusBadge(status, type)}</div>
    </div>
  );

  const InfoRow = ({
    label, value, icon: Icon, testId,
  }: { label: string; value: string | null | undefined; icon: any; testId: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b last:border-0 gap-2">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Icon className="w-4 h-4 opacity-70 shrink-0" />
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="font-semibold text-sm text-foreground sm:text-right pl-7 sm:pl-0" data-testid={testId}>
        {!value || value === "unavailable" ? (
          <span className="text-muted-foreground font-normal italic">Unavailable</span>
        ) : (
          value
        )}
      </div>
    </div>
  );

  const amountDisplay =
    results.amount != null
      ? `$${(results.amount / 100).toFixed(2)} ${results.currency ?? "CAD"}`
      : "$0.99 CAD";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 py-8 px-4">

        {/* Email delivery banner */}
        {results.emailSent ? (
          <div
            className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-2xl p-4 text-sm"
            data-testid="text-results-delivery-note"
          >
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <span className="text-success font-medium">
              Your device-check results are shown below and have also been emailed to you.
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 bg-muted border rounded-2xl p-4 text-sm"
            data-testid="text-results-delivery-note"
          >
            <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              Your results are shown below. We were unable to send the email copy — please save this page.
            </span>
          </div>
        )}

        {/* Receipt header */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-4 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-results-title">
            Device Check Receipt
          </h1>
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-1.5 rounded-full text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Paid &amp; Completed
          </div>
        </div>

        {/* Order summary */}
        <Card className="rounded-[2rem] shadow-md border overflow-hidden bg-card">
          <div className="bg-muted/50 px-6 py-4 border-b">
            <h2 className="font-bold text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" /> Order Summary
            </h2>
          </div>
          <CardContent className="p-0">
            <InfoRow
              label="Order ID"
              value={`#${results.orderId.split("-")[0].toUpperCase()}`}
              icon={Hash}
              testId="text-results-orderid"
            />
            <InfoRow
              label="Date"
              value={
                results.checkedAt
                  ? new Date(results.checkedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"
              }
              icon={Activity}
              testId="text-results-date"
            />
            <InfoRow
              label={`Identifier (${results.identifierType.toUpperCase()})`}
              value={results.identifierMasked}
              icon={Hash}
              testId="text-results-identifier"
            />
            <InfoRow label="Amount Paid" value={amountDisplay} icon={CreditCard} testId="text-results-amount" />
            <InfoRow label="Data Provider" value={results.providerName} icon={Server} testId="text-results-provider" />
          </CardContent>
        </Card>

        {/* Status checks */}
        <Card className="rounded-[2rem] shadow-xl border-0 overflow-hidden bg-card relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-32 pointer-events-none" />
          <div className="bg-muted/30 px-6 py-4 border-b">
            <h2 className="font-bold text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" /> Status Checks
            </h2>
          </div>
          <CardContent className="p-2 sm:p-4">
            <div className="bg-background rounded-3xl border shadow-sm">
              <StatusRow
                label="Blacklist Status"
                status={results.blacklistStatus}
                type="blacklist"
                icon={ShieldCheck}
                testId="text-results-blacklist"
              />
              <StatusRow
                label="Activation Lock"
                status={results.activationLockStatus}
                type="activation"
                icon={Lock}
                testId="text-results-activation"
              />
              <StatusRow
                label="Find My Status"
                status={results.findMyStatus}
                type="activation"
                icon={Smartphone}
                testId="text-results-findmy"
              />
            </div>
          </CardContent>
        </Card>

        {/* Device details */}
        <Card className="rounded-[2rem] shadow-md border overflow-hidden bg-card">
          <div className="bg-muted/50 px-6 py-4 border-b">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" /> Device Details
            </h2>
          </div>
          <CardContent className="p-0">
            <InfoRow label="Brand" value={results.brand} icon={Smartphone} testId="text-results-brand" />
            <InfoRow label="Model" value={results.model} icon={Activity} testId="text-results-model" />
            <InfoRow label="Manufacturer" value={results.manufacturer} icon={Server} testId="text-results-manufacturer" />
            {results.providerCoverageNotes && (
              <div className="p-5 border-t bg-muted/20 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Coverage Notes:</span>{" "}
                {results.providerCoverageNotes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <div className="bg-muted rounded-[2rem] p-6 text-sm text-muted-foreground space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4" /> Important Disclaimers
          </h3>
          <div className="space-y-2">
            <div className="flex gap-3 items-start">
              <ShieldCheck className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
              <span data-testid="text-results-notice-auth">We return results only from authorized data sources.</span>
            </div>
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
              <span data-testid="text-results-notice-unavail">
                Some checks may be unavailable depending on provider support. Unavailable fields are not inferred.
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
              <span data-testid="text-results-notice-apple">
                Apple-related statuses are shown only when returned by the configured provider and are not inferred.
              </span>
            </div>
          </div>
        </div>

        {/* Start another check */}
        <div className="text-center pb-8">
          <Link href="/order">
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 border-2 font-semibold">
              Start Another Check <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
