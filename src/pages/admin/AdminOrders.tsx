import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  amount: number;
  discount: number | null;
  coupon_code: string | null;
  payment_method: string | null;
  payment_status: string | null;
  transaction_id: string | null;
  delivery_email_sent: boolean | null;
  download_count: number | null;
  max_downloads: number | null;
  created_at: string;
  book_id: string | null;
  books?: { title: string } | null;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, books(title)")
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const statusColor = (status: string | null) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const statusLabel = (status: string | null) => {
    switch (status) {
      case "paid": return "পেইড";
      case "pending": return "পেন্ডিং";
      case "failed": return "ব্যর্থ";
      default: return status || "—";
    }
  };

  const handleResendEmail = async (order: Order) => {
    toast({ title: "ইমেইল পাঠানো হচ্ছে...", description: `${order.customer_email} এ ডেলিভারি ইমেইল পাঠানো হবে।` });
    // TODO: implement edge function for resending email
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-bengali text-foreground mb-6">অর্ডার ম্যানেজমেন্ট</h1>

      <Card className="shadow-brand-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground font-bengali">লোড হচ্ছে...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-bengali">এখনো কোনো অর্ডার আসেনি।</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bengali">গ্রাহক</TableHead>
                  <TableHead className="font-bengali">বই</TableHead>
                  <TableHead className="font-bengali">পরিমাণ</TableHead>
                  <TableHead className="font-bengali">পেমেন্ট</TableHead>
                  <TableHead className="font-bengali">ইমেইল</TableHead>
                  <TableHead className="font-bengali">তারিখ</TableHead>
                  <TableHead className="font-bengali text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-bengali font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                    </TableCell>
                    <TableCell className="font-bengali">{order.books?.title || "—"}</TableCell>
                    <TableCell>৳{order.amount}</TableCell>
                    <TableCell>
                      <span className={`badge-pill text-xs ${statusColor(order.payment_status)}`}>
                        {statusLabel(order.payment_status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`badge-pill text-xs ${order.delivery_email_sent ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                        {order.delivery_email_sent ? "পাঠানো" : "পাঠানো হয়নি"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("bn-BD")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleResendEmail(order)} title="ইমেইল পাঠান"><Mail className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bengali">অর্ডার বিস্তারিত</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 mt-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-bengali text-muted-foreground">নাম:</span> <span className="font-bengali">{selectedOrder.customer_name}</span></div>
                <div><span className="font-bengali text-muted-foreground">ইমেইল:</span> {selectedOrder.customer_email}</div>
                <div><span className="font-bengali text-muted-foreground">ফোন:</span> {selectedOrder.customer_phone || "—"}</div>
                <div><span className="font-bengali text-muted-foreground">পরিমাণ:</span> ৳{selectedOrder.amount}</div>
                <div><span className="font-bengali text-muted-foreground">ডিসকাউন্ট:</span> ৳{selectedOrder.discount || 0}</div>
                <div><span className="font-bengali text-muted-foreground">কুপন:</span> {selectedOrder.coupon_code || "—"}</div>
                <div><span className="font-bengali text-muted-foreground">পেমেন্ট মেথড:</span> {selectedOrder.payment_method || "—"}</div>
                <div><span className="font-bengali text-muted-foreground">ট্রানজেকশন ID:</span> {selectedOrder.transaction_id || "—"}</div>
                <div><span className="font-bengali text-muted-foreground">ডাউনলোড:</span> {selectedOrder.download_count}/{selectedOrder.max_downloads}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
