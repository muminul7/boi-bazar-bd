import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ShoppingCart, DollarSign, Tag } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ books: 0, orders: 0, revenue: 0, coupons: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [booksRes, ordersRes, couponsRes] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("amount, payment_status"),
        supabase.from("coupons").select("id", { count: "exact", head: true }),
      ]);

      const paidOrders = (ordersRes.data || []).filter((o) => o.payment_status === "paid");
      const revenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

      setStats({
        books: booksRes.count || 0,
        orders: (ordersRes.data || []).length,
        revenue,
        coupons: couponsRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "মোট বই", value: stats.books, icon: BookOpen, color: "text-primary" },
    { title: "মোট অর্ডার", value: stats.orders, icon: ShoppingCart, color: "text-secondary" },
    { title: "মোট আয়", value: `৳${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { title: "কুপন", value: stats.coupons, icon: Tag, color: "text-purple-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-bengali text-foreground mb-6">ড্যাশবোর্ড</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
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
    </div>
  );
}
