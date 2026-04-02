import { useGetOrderResults, getGetOrderResultsQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Results() {
  const { orderId } = useParams();
  
  const { data: results, isLoading, error } = useGetOrderResults(orderId || "", {
    query: {
      enabled: !!orderId,
      queryKey: getGetOrderResultsQueryKey(orderId || ""),
      retry: false
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-lg">Fetching results...</p>
        </div>
      </Layout>
    );
  }

  // Handle 402 Payment Required or other errors
  if (error) {
    const isPaymentRequired = (error as any)?.response?.status === 402;
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error retrieving results</AlertTitle>
            <AlertDescription data-testid="text-results-error">
              {isPaymentRequired 
                ? "This order has not been paid for yet. Please complete payment to view results." 
                : "We could not fetch the results for this order. It may be invalid or still processing."}
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (!results) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Results Found</AlertTitle>
            <AlertDescription>No results were returned for this order.</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const displayValue = (val: string | null | undefined, status?: string | null) => {
    if (status === "unavailable" || val === null || val === undefined) {
      return <span className="text-muted-foreground italic">Unavailable from provider</span>;
    }
    return val;
  };

  const displayStatus = (status: string | null | undefined) => {
    if (!status || status === "unavailable") {
      return <span className="text-muted-foreground italic">Unavailable from provider</span>;
    }
    return <span className="capitalize">{status.replace(/_/g, " ")}</span>;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" data-testid="text-results-title">Device Check Results</h1>
          <p className="text-muted-foreground">Order ID: {results.orderId}</p>
        </div>

        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <dl className="divide-y divide-border">
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Identifier ({results.identifierType.toUpperCase()})</dt>
                <dd className="col-span-2 text-sm font-semibold" data-testid="text-results-identifier">{results.identifierMasked}</dd>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Brand</dt>
                <dd className="col-span-2 text-sm" data-testid="text-results-brand">{displayValue(results.brand)}</dd>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Model</dt>
                <dd className="col-span-2 text-sm" data-testid="text-results-model">{displayValue(results.model)}</dd>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Manufacturer</dt>
                <dd className="col-span-2 text-sm" data-testid="text-results-manufacturer">{displayValue(results.manufacturer)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle>Check Statuses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <dl className="divide-y divide-border">
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Blacklist Status</dt>
                <dd className="col-span-2 text-sm" data-testid="text-results-blacklist">{displayStatus(results.blacklistStatus)}</dd>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Activation Lock</dt>
                <dd className="col-span-2 text-sm" data-testid="text-results-activation">{displayStatus(results.activationLockStatus)}</dd>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Find My Status</dt>
                <dd className="col-span-2 text-sm" data-testid="text-results-findmy">{displayStatus(results.findMyStatus)}</dd>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Provider</dt>
                <dd className="col-span-2 text-sm text-muted-foreground">{displayValue(results.providerName)}</dd>
              </div>
              {results.providerCoverageNotes && (
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Coverage Notes</dt>
                  <dd className="col-span-2 text-sm text-muted-foreground">{results.providerCoverageNotes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <div className="bg-muted p-6 rounded-lg text-sm text-muted-foreground space-y-4">
          <h3 className="font-semibold text-foreground">Disclaimers</h3>
          <div className="flex gap-3"><ShieldCheck className="w-4 h-4 shrink-0 text-primary" /><span data-testid="text-results-notice-auth">We return results only from authorized data sources.</span></div>
          <div className="flex gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-primary" /><span data-testid="text-results-notice-unavail">Some checks may be unavailable depending on provider support.</span></div>
          <div className="flex gap-3"><CheckCircle2 className="w-4 h-4 shrink-0 text-primary" /><span data-testid="text-results-notice-apple">Apple-related statuses are shown only when returned by the configured provider and are not inferred.</span></div>
        </div>
      </div>
    </Layout>
  );
}
