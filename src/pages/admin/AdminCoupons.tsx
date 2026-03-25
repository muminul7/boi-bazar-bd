import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTableContentSkeleton } from "@/components/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { Tables } from "@/integrations/supabase/types";

type Coupon = Tables<"coupons">;

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    code: "", discount_type: "percentage" as string, discount_value: 0,
    max_uses: null as number | null, expires_at: "", active: true,
  });

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => {
    setForm({ code: "", discount_type: "percentage", discount_value: 0, max_uses: null, expires_at: "", active: true });
    setEditing(null);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: c.discount_value,
      max_uses: c.max_uses, expires_at: c.expires_at ? c.expires_at.split("T")[0] : "", active: c.active !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      if (editing) {
        const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "কুপন আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("coupons").insert(payload);
        if (error) throw error;
        toast({ title: "নতুন কুপন তৈরি হয়েছে" });
      }
      setDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই কুপন মুছতে চান?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast({ title: "কুপন মুছে ফেলা হয়েছে" });
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-bengali text-foreground">কুপন ম্যানেজমেন্ট</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bengali"><Plus className="h-4 w-4" /> নতুন কুপন</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bengali">{editing ? "কুপন সম্পাদনা" : "নতুন কুপন"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="font-bengali">কুপন কোড</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. EKITAB20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bengali">ডিসকাউন্ট ধরন</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                      <SelectItem value="fixed">নির্দিষ্ট (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">ডিসকাউন্ট মান</Label>
                  <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bengali">সর্বোচ্চ ব্যবহার</Label>
                  <Input type="number" value={form.max_uses || ""} onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })} placeholder="সীমাহীন" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">মেয়াদ শেষ</Label>
                  <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label className="font-bengali">সক্রিয়</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="font-bengali">বাতিল</Button>
              <Button onClick={handleSave} className="font-bengali">{editing ? "আপডেট" : "তৈরি করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-brand-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <AdminTableContentSkeleton rows={5} columns={6} />
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-bengali">কোনো কুপন নেই।</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bengali">কোড</TableHead>
                  <TableHead className="font-bengali">ডিসকাউন্ট</TableHead>
                  <TableHead className="font-bengali">ব্যবহার</TableHead>
                  <TableHead className="font-bengali">মেয়াদ</TableHead>
                  <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                  <TableHead className="font-bengali text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold">{c.code}</TableCell>
                    <TableCell>{c.discount_type === "percentage" ? `${c.discount_value}%` : `৳${c.discount_value}`}</TableCell>
                    <TableCell>{c.used_count || 0}/{c.max_uses || "∞"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString("bn-BD") : "সীমাহীন"}
                    </TableCell>
                    <TableCell>
                      <span className={`badge-pill text-xs ${c.active ? "bg-primary-subtle text-primary" : "bg-muted text-muted-foreground"}`}>
                        {c.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
