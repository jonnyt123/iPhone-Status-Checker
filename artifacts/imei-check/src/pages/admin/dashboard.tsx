import { useGetAdminMe, useGetAdminStats, useListAdminOrders, useAdminLogout, getGetAdminMeQueryKey, getGetAdminStatsQueryKey, getListAdminOrdersQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, LogOut, ShieldAlert, BadgeDollarSign, Activity, FileText, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [checkStatus, setCheckStatus] = useState<string>("all");

  const { data: me, isLoading: isLoadingMe, error: meError } = useGetAdminMe({
    query: { queryKey: getGetAdminMeQueryKey(), retry: false }
  });

  const { data: stats, isLoading: isLoadingStats } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey(), enabled: !!me?.authenticated }
  });

  const listParams: any = { page: 1, limit: 50 };
  if (search) listParams.search = search;
  if (paymentStatus !== "all") listParams.paymentStatus = paymentStatus;
  if (checkStatus !== "all") listParams.checkStatus = checkStatus;

  const { data: ordersData, isLoading: isLoadingOrders } = useListAdminOrders(listParams, {
    query: { queryKey: getListAdminOrdersQueryKey(listParams), enabled: !!me?.authenticated }
  });

  const logout = useAdminLogout();

  useEffect(() => {
    if (!isLoadingMe && (!me || !me.authenticated || meError)) {
      setLocation("/admin");
    }
  }, [me, isLoadingMe, meError, setLocation]);

  if (isLoadingMe || !me?.authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/admin");
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-20 backdrop-blur-md bg-card/80">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight" data-testid="text-admin-header">Admin Control</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">{me.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full" data-testid="button-admin-logout">
              <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {isLoadingStats ? (
          <div className="h-32 flex items-center justify-center border rounded-3xl bg-card"><Loader2 className="animate-spin w-8 h-8 text-muted-foreground" /></div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-3xl shadow-sm border-0 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BadgeDollarSign className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight" data-testid="text-admin-stat-revenue">${stats.revenueCAD.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-0 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Orders Today</CardTitle>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight" data-testid="text-admin-stat-today">{stats.ordersToday}</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-0 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paid Orders</CardTitle>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight" data-testid="text-admin-stat-paid">{stats.paidOrders}</div>
                <p className="text-xs font-medium text-muted-foreground mt-1">out of {stats.totalOrders} total</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-0 bg-card relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Refund Review</CardTitle>
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-destructive" data-testid="text-admin-stat-refund">{stats.refundReview}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card className="rounded-3xl shadow-md border-0 bg-card overflow-hidden">
          <CardHeader className="border-b bg-muted/20 px-6 py-5">
            <CardTitle className="text-xl">Recent Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Input 
                  placeholder="Search email or identifier..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full bg-background border-border pl-4 h-10"
                  data-testid="input-admin-search"
                />
              </div>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="w-[160px] rounded-full h-10 bg-background" data-testid="select-admin-payment">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={checkStatus} onValueChange={setCheckStatus}>
                <SelectTrigger className="w-[160px] rounded-full h-10 bg-background" data-testid="select-admin-check">
                  <SelectValue placeholder="Check Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Checks</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingOrders ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
            ) : !ordersData || ordersData.orders.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold px-6">Date</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Identifier</TableHead>
                      <TableHead className="font-semibold">Payment</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold px-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.orders.map(order => (
                      <TableRow key={order.id} className="cursor-default hover:bg-muted/30 transition-colors" data-testid={`row-admin-order-${order.id}`}>
                        <TableCell className="whitespace-nowrap px-6 text-muted-foreground font-medium">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="font-medium">{order.email}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{order.identifierMasked}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-0 rounded-full px-2.5 py-0.5 font-semibold text-xs ${order.paymentStatus === 'paid' ? 'bg-success/15 text-success' : order.paymentStatus === 'refunded' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-0 rounded-full px-2.5 py-0.5 font-semibold text-xs ${order.checkStatus === 'completed' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {order.checkStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="secondary" size="sm" className="rounded-full px-4" data-testid={`link-admin-order-${order.id}`}>View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
