import { useGetAdminMe, useGetAdminOrder, useGetAuditLogs, useAdminResendEmail, useAdminMarkRefundReview, getGetAdminMeQueryKey, getGetAdminOrderQueryKey, getGetAuditLogsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation, useParams } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Mail, AlertTriangle, Clock } from "lucide-react";
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  if (!order) {
    return <div className="p-8 text-center">Order not found.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <span className="font-semibold">Order Details</span>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-mono text-sm" data-testid="text-admin-detail-id">{order.id}</h1>
            <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResendEmail} disabled={resendEmail.isPending} data-testid="button-admin-resend">
              <Mail className="w-4 h-4 mr-2" /> Resend Email
            </Button>
            {!order.refundReview && (
              <Button variant="destructive" onClick={handleMarkRefund} disabled={markRefund.isPending} data-testid="button-admin-refund">
                <AlertTriangle className="w-4 h-4 mr-2" /> Mark Refund Review
              </Button>
            )}
          </div>
        </div>

        {order.refundReview && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">This order has been flagged for refund review.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Customer & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div>{order.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Payment Status</div>
                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'} className="mt-1">{order.paymentStatus}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Amount</div>
                  <div className="mt-1">${order.amount.toFixed(2)} {order.currency}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Stripe Session ID</div>
                <div className="text-xs font-mono truncate">{order.stripeCheckoutSessionId || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Stripe Payment Intent</div>
                <div className="text-xs font-mono truncate">{order.stripePaymentIntentId || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Device Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Identifier ({order.identifierType})</div>
                  <div className="font-mono text-sm mt-1">{order.identifierMasked}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Check Status</div>
                  <Badge variant={order.checkStatus === 'completed' ? 'default' : 'secondary'} className="mt-1">{order.checkStatus}</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t grid grid-cols-2 gap-y-4 gap-x-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Brand / Model</div>
                  <div>{order.brand || 'Unknown'} {order.model || ''}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Provider</div>
                  <div>{order.providerName || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Blacklist</div>
                  <div className="capitalize">{order.blacklistStatus?.replace('_', ' ') || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Find My</div>
                  <div className="capitalize">{order.findMyStatus?.replace('_', ' ') || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            {!auditLogsData?.logs.length ? (
              <div className="text-muted-foreground italic text-sm">No logs found.</div>
            ) : (
              <div className="space-y-4">
                {auditLogsData.logs.map(log => (
                  <div key={log.id} className="text-sm border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-foreground">{log.eventType}</span>
                      <span className="text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    {log.eventPayload && (
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto max-h-32">
                        {JSON.stringify(log.eventPayload, null, 2)}
                      </pre>
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
