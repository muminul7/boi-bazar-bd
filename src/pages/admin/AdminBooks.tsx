import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Upload, FileText, Image, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Book = Tables<"books">;

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [ebookUploading, setEbookUploading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", subtitle: "", slug: "", author: "", price: 0, original_price: 0,
    category: "", description: "", short_description: "", featured: false,
    best_seller: false, new_release: false, pages: 0, active: true,
    cover_url: "", file_url: "",
  });

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    setBooks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const resetForm = () => {
    setForm({ title: "", subtitle: "", slug: "", author: "", price: 0, original_price: 0, category: "", description: "", short_description: "", featured: false, best_seller: false, new_release: false, pages: 0, active: true, cover_url: "", file_url: "" });
    setEditingBook(null);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title, subtitle: book.subtitle || "", slug: book.slug,
      author: book.author, price: book.price, original_price: book.original_price || 0,
      category: book.category || "", description: book.description || "",
      short_description: book.short_description || "", featured: book.featured || false,
      best_seller: book.best_seller || false, new_release: book.new_release || false,
      pages: book.pages || 0, active: book.active !== false,
      cover_url: book.cover_url || "", file_url: book.file_url || "",
    });
    setDialogOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("book-covers").upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("book-covers").getPublicUrl(fileName);
      setForm(f => ({ ...f, cover_url: urlData.publicUrl }));
      toast({ title: "কভার আপলোড হয়েছে ✓" });
    } catch (err: any) {
      toast({ title: "কভার আপলোড ব্যর্থ", description: err.message, variant: "destructive" });
    } finally {
      setCoverUploading(false);
    }
  };

  const handleEbookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEbookUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("ebooks").upload(fileName, file);
      if (error) throw error;
      // Store the path for signed URL generation in download-ebook function
      setForm(f => ({ ...f, file_url: `ebooks/${fileName}` }));
      toast({ title: "ই-বুক ফাইল আপলোড হয়েছে ✓" });
    } catch (err: any) {
      toast({ title: "ই-বুক আপলোড ব্যর্থ", description: err.message, variant: "destructive" });
    } finally {
      setEbookUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (editingBook) {
        const { error } = await supabase.from("books").update(payload).eq("id", editingBook.id);
        if (error) throw error;
        toast({ title: "বই আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("books").insert(payload);
        if (error) throw error;
        toast({ title: "নতুন বই যোগ হয়েছে" });
      }
      setDialogOpen(false);
      resetForm();
      fetchBooks();
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই বই মুছতে চান?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) { toast({ title: "ত্রুটি", description: error.message, variant: "destructive" }); return; }
    toast({ title: "বই মুছে ফেলা হয়েছে" });
    fetchBooks();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-bengali text-foreground">বই ম্যানেজমেন্ট</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bengali"><Plus className="h-4 w-4" /> নতুন বই</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-bengali">{editingBook ? "বই সম্পাদনা" : "নতুন বই যোগ করুন"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Basic fields */}
              <div className="col-span-2 space-y-2">
                <Label className="font-bengali">শিরোনাম</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">সাবটাইটেল</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">স্লাগ (URL)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. my-book" />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">লেখক</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">ক্যাটেগরি</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">মূল্য (৳)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">আসল মূল্য (৳)</Label>
                <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">পৃষ্ঠা সংখ্যা</Label>
                <Input type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="font-bengali">সংক্ষিপ্ত বিবরণ</Label>
                <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="font-bengali">বিবরণ</Label>
                <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Cover Image Upload */}
              <div className="col-span-2 space-y-2">
                <Label className="font-bengali flex items-center gap-2"><Image className="h-4 w-4" /> কভার ইমেজ</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1">
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${form.cover_url ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      {coverUploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-sm font-bengali text-muted-foreground">আপলোড হচ্ছে...</span></>
                      ) : form.cover_url ? (
                        <><CheckCircle className="h-4 w-4 text-primary" /><span className="text-sm font-bengali text-primary">কভার আপলোড হয়েছে</span></>
                      ) : (
                        <><Upload className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-bengali text-muted-foreground">JPG, PNG ইমেজ বেছে নিন</span></>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
                  </label>
                  {form.cover_url && (
                    <img src={form.cover_url} alt="Cover" className="h-16 w-12 object-cover rounded-lg border border-border" />
                  )}
                </div>
                <Input placeholder="অথবা কভার URL পেস্ট করুন" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} className="text-xs" />
              </div>

              {/* Ebook File Upload */}
              <div className="col-span-2 space-y-2">
                <Label className="font-bengali flex items-center gap-2"><FileText className="h-4 w-4" /> ই-বুক ফাইল (PDF)</Label>
                <label>
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${form.file_url ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    {ebookUploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-sm font-bengali text-muted-foreground">আপলোড হচ্ছে...</span></>
                    ) : form.file_url ? (
                      <><CheckCircle className="h-4 w-4 text-primary" /><span className="text-sm font-bengali text-primary">ফাইল আপলোড হয়েছে — {form.file_url.split("/").pop()}</span></>
                    ) : (
                      <><Upload className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-bengali text-muted-foreground">PDF ফাইল বেছে নিন</span></>
                    )}
                  </div>
                  <input type="file" accept=".pdf,.epub" className="hidden" onChange={handleEbookUpload} disabled={ebookUploading} />
                </label>
                <Input placeholder="অথবা ফাইল পাথ/URL পেস্ট করুন" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} className="text-xs" />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label className="font-bengali">ফিচার্ড</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.best_seller} onCheckedChange={(v) => setForm({ ...form, best_seller: v })} />
                <Label className="font-bengali">বেস্টসেলার</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.new_release} onCheckedChange={(v) => setForm({ ...form, new_release: v })} />
                <Label className="font-bengali">নতুন রিলিজ</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label className="font-bengali">সক্রিয়</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="font-bengali">বাতিল</Button>
              <Button onClick={handleSave} className="font-bengali">{editingBook ? "আপডেট" : "যোগ করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-brand-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground font-bengali">লোড হচ্ছে...</div>
          ) : books.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-bengali">কোনো বই পাওয়া যায়নি। উপরে "নতুন বই" বাটনে ক্লিক করুন।</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bengali">কভার</TableHead>
                  <TableHead className="font-bengali">শিরোনাম</TableHead>
                  <TableHead className="font-bengali">লেখক</TableHead>
                  <TableHead className="font-bengali">মূল্য</TableHead>
                  <TableHead className="font-bengali">ফাইল</TableHead>
                  <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                  <TableHead className="font-bengali text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="h-10 w-8 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-8 bg-muted rounded flex items-center justify-center"><Image className="h-4 w-4 text-muted-foreground" /></div>
                      )}
                    </TableCell>
                    <TableCell className="font-bengali font-medium">{book.title}</TableCell>
                    <TableCell className="font-bengali">{book.author}</TableCell>
                    <TableCell>৳{book.price}</TableCell>
                    <TableCell>
                      {book.file_url ? (
                        <span className="text-xs text-primary flex items-center gap-1"><FileText className="h-3 w-3" /> আছে</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">নেই</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`badge-pill text-xs ${book.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {book.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(book)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(book.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
