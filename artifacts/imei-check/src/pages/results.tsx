import { useGetOrderResults, getGetOrderResultsQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, CheckCircle2, Loader2, Smartphone, FileText, Activity, Server, Hash, Check, X, Minus } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-muted animate-pulse" />
            <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground font-medium">Retrieving device report...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    const isPaymentRequired = (error as any)?.response?.status === 402;
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-16 px-4">
          <div className="bg-destructive/5 border border-destructive/20 rounded-[2rem] p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Report Unavailable</h2>
            <p className="text-muted-foreground text-lg" data-testid="text-results-error">
              {isPaymentRequired 
                ? "This order requires payment before results can be viewed." 
                : "We could not fetch the results. The check may still be processing or the link is invalid."}
            </p>
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

  const getStatusBadge = (status: string | null | undefined, type: 'blacklist' | 'activation') => {
    if (!status || status === "unavailable") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
          <Minus className="w-4 h-4" /> Unavailable
        </span>
      );
    }

    if (type === 'blacklist') {
      if (status === 'clear') {
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

    // Activation / Find My
    if (status === 'off') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-success/15 text-success">
          <Check className="w-4 h-4" /> Off
        </span>
      );
    }
    if (status === 'on') {
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

  const InfoRow = ({ label, value, icon: Icon, testId }: { label: string, value: string | null | undefined, icon: any, testId: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b last:border-0 gap-2">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Icon className="w-5 h-5 opacity-70" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="font-semibold text-foreground sm:text-right pl-8 sm:pl-0" data-testid={testId}>
        {!value || value === "unavailable" ? <span className="text-muted-foreground font-normal italic">Unavailable</span> : value}
      </div>
    </div>
  );

  const StatusRow = ({ label, status, type, icon: Icon, testId }: { label: string, status: string | null | undefined, type: 'blacklist' | 'activation', icon: any, testId: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b last:border-0 gap-3">
      <div className="flex items-center gap-3 text-foreground">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="font-semibold text-lg">{label}</span>
      </div>
      <div data-testid={testId} className="pl-13 sm:pl-0">
        {getStatusBadge(status, type)}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-4 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-results-title">Device Report</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Hash className="w-4 h-4" /> Order #{results.orderId.split('-')[0]}
          </p>
        </div>

        {/* Statuses Card */}
        <Card className="rounded-[2rem] shadow-xl border-0 overflow-hidden bg-card relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-32 pointer-events-none" />
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

        {/* Details Card */}
        <Card className="rounded-[2rem] shadow-md border overflow-hidden bg-card">
          <div className="bg-muted/50 px-6 py-5 border-b">
            <h2 className="text-lg font-bold flex items-center gap-2"><Smartphone className="w-5 h-5 text-muted-foreground" /> Device Specifications</h2>
          </div>
          <CardContent className="p-0">
            <InfoRow label={`Identifier (${results.identifierType.toUpperCase()})`} value={results.identifierMasked} icon={Hash} testId="text-results-identifier" />
            <InfoRow label="Brand" value={results.brand} icon={Smartphone} testId="text-results-brand" />
            <InfoRow label="Model" value={results.model} icon={Activity} testId="text-results-model" />
            <InfoRow label="Manufacturer" value={results.manufacturer} icon={Server} testId="text-results-manufacturer" />
            <InfoRow label="Provider" value={results.providerName} icon={Activity} testId="text-results-provider" />
            {results.providerCoverageNotes && (
              <div className="p-5 border-t bg-muted/20 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Coverage Notes:</span> {results.providerCoverageNotes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <div className="bg-muted rounded-[2rem] p-8 text-sm text-muted-foreground space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Important Disclaimers</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex gap-3 items-start"><ShieldCheck className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span data-testid="text-results-notice-auth">We return results only from authorized data sources.</span></div>
            <div className="flex gap-3 items-start"><AlertCircle className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span data-testid="text-results-notice-unavail">Some checks may be unavailable depending on provider support.</span></div>
            <div className="flex gap-3 items-start sm:col-span-2"><CheckCircle2 className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span data-testid="text-results-notice-apple">Apple-related statuses are shown only when returned by the configured provider and are not inferred.</span></div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
