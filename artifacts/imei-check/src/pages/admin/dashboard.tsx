import { useGetAdminMe, useGetAdminStats, useListAdminOrders, useAdminLogout, getGetAdminMeQueryKey, getGetAdminStatsQueryKey, getListAdminOrdersQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, LogOut, ShieldAlert, BadgeDollarSign, Activity, FileText } from "lucide-react";
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/admin");
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="font-semibold" data-testid="text-admin-header">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{me.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        {isLoadingStats ? (
          <div className="h-32 flex items-center justify-center border rounded-xl"><Loader2 className="animate-spin w-6 h-6" /></div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <BadgeDollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-admin-stat-revenue">${stats.revenueCAD.toFixed(2)} CAD</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-admin-stat-today">{stats.ordersToday}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-admin-stat-paid">{stats.paidOrders}</div>
                <p className="text-xs text-muted-foreground">out of {stats.totalOrders} total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Refund Review</CardTitle>
                <ShieldAlert className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive" data-testid="text-admin-stat-refund">{stats.refundReview}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Input 
                placeholder="Search email or identifier..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
                data-testid="input-admin-search"
              />
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="w-[180px]" data-testid="select-admin-payment">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={checkStatus} onValueChange={setCheckStatus}>
                <SelectTrigger className="w-[180px]" data-testid="select-admin-check">
                  <SelectValue placeholder="Check Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Checks</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="py-12 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : !ordersData || ordersData.orders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">No orders found.</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Identifier</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Check</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.orders.map(order => (
                      <TableRow key={order.id} data-testid={`row-admin-order-${order.id}`}>
                        <TableCell className="whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{order.email}</TableCell>
                        <TableCell className="font-mono text-xs">{order.identifierMasked}</TableCell>
                        <TableCell>
                          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>{order.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.checkStatus === 'completed' ? 'default' : 'secondary'}>{order.checkStatus}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`link-admin-order-${order.id}`}>View</Button>
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
