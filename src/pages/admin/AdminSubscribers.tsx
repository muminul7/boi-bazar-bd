import { useEffect, useState } from "react";
import { Mail, Download, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "ডাটা লোড করতে সমস্যা", variant: "destructive" });
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) {
      toast({ title: "ডিলিট করতে সমস্যা", variant: "destructive" });
    } else {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "সাবস্ক্রাইবার ডিলিট করা হয়েছে" });
    }
  };

  const handleExportCSV = () => {
    if (!subscribers.length) return;
    const csv = "Email,Subscribed At\n" + subscribers.map((s) => `${s.email},${s.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-bengali text-foreground">সাবস্ক্রাইবার</h1>
            <p className="text-sm text-muted-foreground font-bengali">মোট {subscribers.length} জন</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubscribers} disabled={loading} className="gap-1.5 font-bengali">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!subscribers.length} className="gap-1.5 font-bengali">
            <Download className="h-4 w-4" /> CSV এক্সপোর্ট
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bengali">ইমেইল</TableHead>
              <TableHead className="font-bengali">তারিখ</TableHead>
              <TableHead className="font-bengali w-20 text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground font-bengali">লোড হচ্ছে...</TableCell></TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground font-bengali">কোনো সাবস্ক্রাইবার নেই</TableCell></TableRow>
            ) : (
              subscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-body">{s.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-body">
                    {new Date(s.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
