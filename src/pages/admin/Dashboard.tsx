import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { BookOpen, ShoppingCart, DollarSign, Tag, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#8b5cf6", "#f59e0b", "#ef4444"];

type Order = {
  id: string;
  amount: number;
  discount: number | null;
  payment_status: string | null;
  created_at: string;
  customer_name: string;
  customer_email: string;
  books?: { title: string } | null;
};

export default function Dashboard() {
  const [stats, setStats] = useState({ books: 0, orders: 0, revenue: 0, coupons: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const fetchAll = useCallback(async () => {
    const [booksRes, ordersRes, couponsRes] = await Promise.all([
      supabase.from("books").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, amount, discount, payment_status, created_at, customer_name, customer_email, books(title)").order("created_at", { ascending: false }),
      supabase.from("coupons").select("id", { count: "exact", head: true }),
    ]);

    const allOrders = (ordersRes.data as any) || [];
    const paidOrders = allOrders.filter((o: any) => o.payment_status === "paid");
    const revenue = paidOrders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    setStats({
      books: booksRes.count || 0,
      orders: allOrders.length,
      revenue,
      coupons: couponsRes.count || 0,
    });
    setOrders(allOrders);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("admin-dashboard-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchAll();
      })
      .subscribe();

    const intervalId = window.setInterval(() => {
      fetchAll();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const filteredOrders = useMemo(() => {
    if (period === "all") return orders;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  }, [orders, period]);

  const paidOrders = useMemo(() => filteredOrders.filter(o => o.payment_status === "paid"), [filteredOrders]);

  const finStats = useMemo(() => {
    const totalRevenue = paidOrders.reduce((s, o) => s + o.amount, 0);
    const totalDiscount = paidOrders.reduce((s, o) => s + (o.discount || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
    const conversionRate = filteredOrders.length > 0 ? Math.round((paidOrders.length / filteredOrders.length) * 100) : 0;
    return { totalRevenue, totalDiscount, avgOrderValue, conversionRate, paidCount: paidOrders.length };
  }, [paidOrders, filteredOrders]);

  const dailyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    paidOrders.forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
      map.set(day, (map.get(day) || 0) + o.amount);
    });
    return Array.from(map.entries()).map(([date, amount]) => ({ date, amount })).reverse().slice(-30);
  }, [paidOrders]);

  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach(o => {
      const s = o.payment_status || "unknown";
      const label =
        s === "paid" ? "সফল" :
        s === "pending" ? "পেন্ডিং" :
        s === "pending_verification" ? "যাচাই চলছে" :
        s === "failed" ? "ব্যর্থ" :
        s === "verification_failed" ? "যাচাই ব্যর্থ" :
        s === "cancelled" ? "বাতিল" :
        s;
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const topBooks = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    paidOrders.forEach(o => {
      const title = o.books?.title || "অজানা বই";
      const prev = map.get(title) || { count: 0, revenue: 0 };
      map.set(title, { count: prev.count + 1, revenue: prev.revenue + o.amount });
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, ...data })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [paidOrders]);

  const recentPaidOrders = useMemo(() => paidOrders.slice(0, 10), [paidOrders]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-bengali">লোড হচ্ছে...</div>;
  }

  const summaryCards = [
    { title: "মোট বই", value: stats.books, icon: BookOpen, color: "text-primary" },
    { title: "মোট অর্ডার", value: stats.orders, icon: ShoppingCart, color: "text-secondary" },
    { title: "মোট আয়", value: `৳${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { title: "কুপন", value: stats.coupons, icon: Tag, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-bengali text-foreground">ড্যাশবোর্ড</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <Card key={c.title} className="shadow-brand-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bengali text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-body">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Analytics Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-bengali text-foreground">📊 ফাইন্যান্সিয়াল অ্যানালিটিক্স</h2>
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

      {/* Finance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bengali text-muted-foreground">ফিল্টার্ড আয়</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-body text-green-600">৳{finStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs font-bengali text-muted-foreground mt-1">{finStats.paidCount}টি সফল অর্ডার</p>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bengali text-muted-foreground">গড় অর্ডার মূল্য</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-body">৳{finStats.avgOrderValue.toLocaleString()}</div>
            <p className="text-xs font-bengali text-muted-foreground mt-1">ছাড়: ৳{finStats.totalDiscount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bengali text-muted-foreground">কনভার্সন রেট</CardTitle>
            {finStats.conversionRate >= 50 ? <ArrowUpRight className="h-5 w-5 text-green-600" /> : <ArrowDownRight className="h-5 w-5 text-destructive" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-body">{finStats.conversionRate}%</div>
            <p className="text-xs font-bengali text-muted-foreground mt-1">অর্ডার → সফল পেমেন্ট</p>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bengali text-muted-foreground">পেন্ডিং/ব্যর্থ</CardTitle>
            <ShoppingCart className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-body">{filteredOrders.filter(o => o.payment_status !== "paid").length}</div>
            <p className="text-xs font-bengali text-muted-foreground mt-1">মোট {filteredOrders.length}টির মধ্যে</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-brand-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-bengali text-base">দৈনিক আয়</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, "আয়"]} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground font-bengali">কোনো ডেটা নেই</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-brand-sm">
          <CardHeader>
            <CardTitle className="font-bengali text-base">পেমেন্ট স্ট্যাটাস</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground font-bengali">কোনো ডেটা নেই</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-brand-sm">
          <CardHeader>
            <CardTitle className="font-bengali text-base">🏆 টপ সেলিং বই</CardTitle>
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

        <Card className="shadow-brand-sm">
          <CardHeader>
            <CardTitle className="font-bengali text-base">💰 সাম্প্রতিক লেনদেন</CardTitle>
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
                        {new Date(o.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
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
