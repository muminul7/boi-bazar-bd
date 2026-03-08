import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star, Quote, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  text: string;
  avatar: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

interface FormState {
  name: string;
  role: string;
  rating: number;
  text: string;
  active: boolean;
  sort_order: number;
}

const defaultForm: FormState = { name: "", role: "", rating: 5, text: "", active: true, sort_order: 0 };

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    setTestimonials((data as Testimonial[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const openAdd = () => {
    setForm({ ...defaultForm, sort_order: testimonials.length });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setForm({ name: t.name, role: t.role || "", rating: t.rating, text: t.text, active: t.active, sort_order: t.sort_order });
    setEditingId(t.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast({ title: "নাম ও মন্তব্য আবশ্যক", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim() || null,
        rating: form.rating,
        text: form.text.trim(),
        avatar: form.name.trim().charAt(0),
        active: form.active,
        sort_order: form.sort_order,
      };

      if (editingId) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "টেস্টিমোনিয়াল আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
        toast({ title: "টেস্টিমোনিয়াল যোগ হয়েছে" });
      }
      setDialogOpen(false);
      fetchTestimonials();
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই টেস্টিমোনিয়াল মুছতে চান?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "টেস্টিমোনিয়াল মুছে ফেলা হয়েছে" });
      fetchTestimonials();
    }
  };

  const toggleActive = async (t: Testimonial) => {
    await supabase.from("testimonials").update({ active: !t.active }).eq("id", t.id);
    fetchTestimonials();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-bengali text-foreground">টেস্টিমোনিয়াল ম্যানেজমেন্ট</h1>
        <Button onClick={openAdd} className="gap-2 font-bengali">
          <Plus className="h-4 w-4" /> নতুন যোগ করুন
        </Button>
      </div>

      <Card className="shadow-brand-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-bengali">
              <Quote className="h-8 w-8 mx-auto mb-2 opacity-40" />
              কোনো টেস্টিমোনিয়াল নেই। "নতুন যোগ করুন" বাটনে ক্লিক করুন।
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bengali w-8">#</TableHead>
                  <TableHead className="font-bengali">নাম</TableHead>
                  <TableHead className="font-bengali">পরিচয়</TableHead>
                  <TableHead className="font-bengali">রেটিং</TableHead>
                  <TableHead className="font-bengali">মন্তব্য</TableHead>
                  <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                  <TableHead className="font-bengali text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">{t.sort_order + 1}</TableCell>
                    <TableCell className="font-bengali font-medium">{t.name}</TableCell>
                    <TableCell className="font-bengali text-sm text-muted-foreground">{t.role || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "text-secondary fill-secondary" : "text-muted"}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bengali max-w-xs truncate text-sm">{t.text}</TableCell>
                    <TableCell>
                      <Switch checked={t.active} onCheckedChange={() => toggleActive(t)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali">
              {editingId ? "টেস্টিমোনিয়াল সম্পাদনা" : "নতুন টেস্টিমোনিয়াল যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-bengali">নাম</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="যেমন: তানভীর হাসান" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">পরিচয় / পদবী</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="যেমন: ফ্যাশন ই-কমার্স মালিক, ঢাকা" maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">রেটিং</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })} className="focus:outline-none transition-transform hover:scale-110">
                    <Star className={`h-7 w-7 ${star <= form.rating ? "text-secondary fill-secondary" : "text-muted"}`} />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">{form.rating}/5</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">মন্তব্য</Label>
              <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="পাঠকের মন্তব্য লিখুন..." rows={3} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">ক্রম (Sort Order)</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} min={0} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label className="font-bengali">সক্রিয়</Label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-bengali">বাতিল</Button>
            <Button onClick={handleSave} disabled={saving} className="font-bengali">
              {saving ? "সেভ হচ্ছে..." : editingId ? "আপডেট" : "যোগ করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
