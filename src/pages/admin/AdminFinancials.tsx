import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, ShoppingCart, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

type Order = {
  id: string;
  amount: number;
  discount: number | null;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string;
  customer_name: string;
  customer_email: string;
  book_id: string | null;
  coupon_code: string | null;
  books?: { title: string } | null;
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export default function AdminFinancials() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, amount, discount, payment_status, payment_method, created_at, customer_name, customer_email, book_id, coupon_code, books(title)")
        .order("created_at", { ascending: false });
      setOrders((data as any) || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (period === "all") return orders;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  }, [orders, period]);

  const paidOrders = useMemo(() => filteredOrders.filter(o => o.payment_status === "paid"), [filteredOrders]);

  const stats = useMemo(() => {
    const totalRevenue = paidOrders.reduce((s, o) => s + o.amount, 0);
    const totalDiscount = paidOrders.reduce((s, o) => s + (o.discount || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
    const pendingOrders = filteredOrders.filter(o => o.payment_status === "pending").length;
    const failedOrders = filteredOrders.filter(o => o.payment_status === "failed" || o.payment_status === "cancelled").length;
    const conversionRate = filteredOrders.length > 0 ? Math.round((paidOrders.length / filteredOrders.length) * 100) : 0;
    return { totalRevenue, totalDiscount, avgOrderValue, paidCount: paidOrders.length, pendingOrders, failedOrders, totalOrders: filteredOrders.length, conversionRate };
  }, [paidOrders, filteredOrders]);

  // Daily revenue chart
  const dailyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    paidOrders.forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
      map.set(day, (map.get(day) || 0) + o.amount);
    });
    return Array.from(map.entries()).map(([date, amount]) => ({ date, amount })).reverse().slice(-30);
  }, [paidOrders]);

  // Payment status distribution
  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach(o => {
      const s = o.payment_status || "unknown";
      const label = s === "paid" ? "সফল" : s === "pending" ? "পেন্ডিং" : s === "failed" ? "ব্যর্থ" : s === "cancelled" ? "বাতিল" : s;
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  // Top selling books
  const topBooks = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    paidOrders.forEach(o => {
      const title = o.books?.title || "অজানা বই";
      const prev = map.get(title) || { count: 0, revenue: 0 };
      map.set(title, { count: prev.count + 1, revenue: prev.revenue + o.amount });
    });
    return Array.from(map.entries())
      .map(([title, data]) => ({ title, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [paidOrders]);

  // Monthly revenue
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    paidOrders.forEach(o => {
      const month = new Date(o.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "short" });
      map.set(month, (map.get(month) || 0) + o.amount);
    });
    return Array.from(map.entries()).map(([month, amount]) => ({ month, amount })).reverse();
  }, [paidOrders]);

  // Recent paid orders
  const recentPaidOrders = useMemo(() => paidOrders.slice(0, 15), [paidOrders]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-bengali">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bengali text-foreground">ফাইন্যান্সিয়াল অ্যানালিটিক্স</h1>
        <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
          <SelectTrigger className="w-[140px] font-bengali">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d" className="font-bengali">গত ৭ দিন</SelectItem>
            <SelectItem value="30d" className="font-bengali">গত ৩০ দিন</SelectItem>
            <SelectItem value="90d" className="font-bengali">গত ৯০ দিন</SelectItem>
            <SelectItem value="all" className="font-bengali">সব সময়</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bengali text-muted-foreground">মোট আয়</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-body text-green-600">৳{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs font-bengali text-muted-foreground mt-1">{stats.paidCount}টি সফল অর্ডার</p>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bengali text-muted-foreground">গড় অর্ডার মূল্য</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-body">৳{stats.avgOrderValue.toLocaleString()}</div>
            <p className="text-xs font-bengali text-muted-foreground mt-1">মোট ছাড়: ৳{stats.totalDiscount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bengali text-muted-foreground">মোট অর্ডার</CardTitle>
            <ShoppingCart className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-body">{stats.totalOrders}</div>
            <p className="text-xs font-bengali text-muted-foreground mt-1">পেন্ডিং: {stats.pendingOrders} | ব্যর্থ: {stats.failedOrders}</p>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bengali text-muted-foreground">কনভার্সন রেট</CardTitle>
            {stats.conversionRate >= 50 ? <ArrowUpRight className="h-5 w-5 text-green-600" /> : <ArrowDownRight className="h-5 w-5 text-destructive" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-body">{stats.conversionRate}%</div>
            <p className="text-xs font-bengali text-muted-foreground mt-1">অর্ডার → পেমেন্ট সফল</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Revenue Chart */}
        <Card className="shadow-brand-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-bengali text-base">দৈনিক আয়</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, "আয়"]} labelStyle={{ fontFamily: "inherit" }} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground font-bengali">কোনো ডেটা নেই</div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status Pie */}
        <Card className="shadow-brand-sm">
          <CardHeader>
            <CardTitle className="font-bengali text-base">পেমেন্ট স্ট্যাটাস</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground font-bengali">কোনো ডেটা নেই</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue */}
      {monthlyRevenue.length > 1 && (
        <Card className="shadow-brand-sm">
          <CardHeader>
            <CardTitle className="font-bengali text-base">মাসিক আয় ট্রেন্ড</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `৳${v}`} />
                <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, "আয়"]} />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Books */}
        <Card className="shadow-brand-sm">
          <CardHeader>
            <CardTitle className="font-bengali text-base">টপ সেলিং বই</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topBooks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bengali">বই</TableHead>
                    <TableHead className="font-bengali text-center">বিক্রি</TableHead>
                    <TableHead className="font-bengali text-right">আয়</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBooks.map((b, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-bengali font-medium">{b.title}</TableCell>
                      <TableCell className="text-center font-body">{b.count}</TableCell>
                      <TableCell className="text-right font-body text-green-600">৳{b.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-muted-foreground font-bengali">কোনো বিক্রি হয়নি</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-brand-sm">
          <CardHeader>
            <CardTitle className="font-bengali text-base">সাম্প্রতিক সফল লেনদেন</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentPaidOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bengali">গ্রাহক</TableHead>
                    <TableHead className="font-bengali">তারিখ</TableHead>
                    <TableHead className="font-bengali text-right">পরিমাণ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPaidOrders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div className="font-bengali font-medium text-sm">{o.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="text-right font-body font-semibold text-green-600">৳{o.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-muted-foreground font-bengali">কোনো লেনদেন নেই</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
