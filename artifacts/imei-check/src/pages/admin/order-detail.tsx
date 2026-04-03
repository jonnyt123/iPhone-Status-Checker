import { useGetAdminMe, useGetAdminOrder, useGetAuditLogs, useAdminResendEmail, useAdminMarkRefundReview, getGetAdminMeQueryKey, getGetAdminOrderQueryKey, getGetAuditLogsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation, useParams } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Mail, AlertTriangle, Clock, ShieldAlert, FileText, Smartphone, Hash, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: me, isLoading: isLoadingMe, error: meError } = useGetAdminMe({
    query: { queryKey: getGetAdminMeQueryKey(), retry: false }
  });

  const { data: order, isLoading: isLoadingOrder } = useGetAdminOrder(orderId || "", {
    query: { queryKey: getGetAdminOrderQueryKey(orderId || ""), enabled: !!me?.authenticated && !!orderId }
  });

  const { data: auditLogsData } = useGetAuditLogs(orderId || "", {
    query: { queryKey: getGetAuditLogsQueryKey(orderId || ""), enabled: !!me?.authenticated && !!orderId }
  });

  const resendEmail = useAdminResendEmail();
  const markRefund = useAdminMarkRefundReview();

  useEffect(() => {
    if (!isLoadingMe && (!me || !me.authenticated || meError)) {
      setLocation("/admin");
    }
  }, [me, isLoadingMe, meError, setLocation]);

  const handleResendEmail = () => {
    if (!orderId) return;
    resendEmail.mutate(
      { orderId },
      {
        onSuccess: () => toast({ title: "Email Queued", description: "The result email has been queued for resending." }),
        onError: () => toast({ title: "Error", description: "Failed to resend email.", variant: "destructive" })
      }
    );
  };

  const handleMarkRefund = () => {
    if (!orderId) return;
    markRefund.mutate(
      { orderId },
      {
        onSuccess: () => {
          toast({ title: "Marked", description: "Order flagged for refund review." });
          queryClient.invalidateQueries({ queryKey: getGetAdminOrderQueryKey(orderId) });
        },
        onError: () => toast({ title: "Error", description: "Failed to mark order.", variant: "destructive" })
      }
    );
  };

  if (isLoadingMe || !me?.authenticated || isLoadingOrder) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground font-medium">Order not found.</div>;
  }

  const DetailRow = ({ label, value, monospace = false }: { label: string, value: React.ReactNode, monospace?: boolean }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b last:border-0 gap-1">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={`text-sm font-semibold text-foreground ${monospace ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      <header className="bg-card border-b sticky top-0 z-20 backdrop-blur-md bg-card/80">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <span className="font-semibold text-lg tracking-tight">Order Details</span>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card rounded-3xl p-6 shadow-sm border">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Hash className="w-4 h-4" />
              <span className="font-mono text-sm tracking-tight">{order.id}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="text-admin-detail-id">{order.email}</h1>
            <p className="text-sm font-medium text-muted-foreground">
              {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full shadow-sm bg-background border-border" onClick={handleResendEmail} disabled={resendEmail.isPending} data-testid="button-admin-resend">
              <Mail className="w-4 h-4 mr-2" /> Resend Results
            </Button>
            {!order.refundReview && (
              <Button variant="outline" className="rounded-full shadow-sm text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleMarkRefund} disabled={markRefund.isPending} data-testid="button-admin-refund">
                <AlertTriangle className="w-4 h-4 mr-2" /> Mark Refund
              </Button>
            )}
          </div>
        </div>

        {order.refundReview && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Refund Review Requested</h3>
              <p className="text-sm opacity-90">This order has been flagged for manual refund review.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-3xl shadow-sm border-0 bg-card overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Payment & Customer</h2>
            </div>
            <CardContent className="p-6">
              <DetailRow label="Email Address" value={order.email} />
              <DetailRow 
                label="Payment Status" 
                value={
                  <Badge variant="outline" className={`border-0 px-2.5 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {order.paymentStatus}
                  </Badge>
                } 
              />
              <DetailRow label="Amount Paid" value={`$${order.amount.toFixed(2)} ${order.currency}`} />
              <DetailRow label="Stripe Session ID" value={order.stripeCheckoutSessionId || 'N/A'} monospace />
              <DetailRow label="Stripe Payment Intent" value={order.stripePaymentIntentId || 'N/A'} monospace />
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-0 bg-card overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Device & Check Status</h2>
            </div>
            <CardContent className="p-6">
              <DetailRow label={`Identifier (${order.identifierType.toUpperCase()})`} value={order.identifierMasked} monospace />
              <DetailRow 
                label="Check Status" 
                value={
                  <Badge variant="outline" className={`border-0 px-2.5 py-0.5 rounded-full ${order.checkStatus === 'completed' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {order.checkStatus}
                  </Badge>
                } 
              />
              <DetailRow label="Device" value={`${order.brand || 'Unknown'} ${order.model || ''}`.trim()} />
              <DetailRow label="Data Provider" value={order.providerName || 'N/A'} />
              
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Blacklist</span>
                  <span className={`font-semibold capitalize flex items-center gap-1.5 ${order.blacklistStatus === 'clear' ? 'text-success' : order.blacklistStatus === 'blacklisted' ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {order.blacklistStatus === 'clear' && <CheckCircle2 className="w-4 h-4" />}
                    {order.blacklistStatus === 'blacklisted' && <XCircle className="w-4 h-4" />}
                    {order.blacklistStatus?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Find My (iCloud)</span>
                  <span className={`font-semibold capitalize flex items-center gap-1.5 ${order.findMyStatus === 'off' ? 'text-success' : order.findMyStatus === 'on' ? 'text-warning' : 'text-muted-foreground'}`}>
                    {order.findMyStatus === 'off' && <CheckCircle2 className="w-4 h-4" />}
                    {order.findMyStatus === 'on' && <ShieldAlert className="w-4 h-4" />}
                    {order.findMyStatus?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl shadow-sm border-0 bg-card overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">System Audit Log</h2>
          </div>
          <CardContent className="p-0">
            {!auditLogsData?.logs.length ? (
              <div className="p-8 text-center text-muted-foreground font-medium bg-background">No events recorded.</div>
            ) : (
              <div className="divide-y divide-border">
                {auditLogsData.logs.map(log => (
                  <div key={log.id} className="p-6 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="rounded-full font-mono text-xs tracking-tight bg-background border shadow-sm">
                        {log.eventType}
                      </Badge>
                      <span className="text-muted-foreground text-xs font-medium">
                        {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' })}
                      </span>
                    </div>
                    {log.eventPayload && (
                      <div className="mt-3 bg-muted/50 rounded-xl p-4 border overflow-x-auto">
                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                          {JSON.stringify(log.eventPayload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
