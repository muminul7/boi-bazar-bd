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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Upload, FileText, Image, CheckCircle, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { Tables } from "@/integrations/supabase/types";

type Book = Tables<"books">;

interface ChapterItem { title: string; topics: string[] }
interface FaqItem { question: string; answer: string }

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
    cover_url: "", file_url: "", language: "বাংলা", format: "PDF",
    published_date: "", tags: [] as string[], outcomes: [] as string[],
    suitable_for: [] as string[], chapters: [] as ChapterItem[], faq: [] as FaqItem[],
  });

  const [tagInput, setTagInput] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");
  const [suitableInput, setSuitableInput] = useState("");
  const [bookFiles, setBookFiles] = useState<Record<string, string>>({});

  const fetchBooks = async () => {
    const [booksRes, filesRes] = await Promise.all([
      supabase.from("books").select("*").order("created_at", { ascending: false }),
      supabase.from("book_files").select("book_id, file_url"),
    ]);
    setBooks(booksRes.data || []);
    const filesMap: Record<string, string> = {};
    (filesRes.data || []).forEach((f: any) => { filesMap[f.book_id] = f.file_url; });
    setBookFiles(filesMap);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const resetForm = () => {
    setForm({
      title: "", subtitle: "", slug: "", author: "", price: 0, original_price: 0,
      category: "", description: "", short_description: "", featured: false,
      best_seller: false, new_release: false, pages: 0, active: true,
      cover_url: "", file_url: "", language: "বাংলা", format: "PDF",
      published_date: "", tags: [], outcomes: [], suitable_for: [], chapters: [], faq: [],
    });
    setEditingBook(null);
    setTagInput(""); setOutcomeInput(""); setSuitableInput("");
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
      cover_url: book.cover_url || "", file_url: bookFiles[book.id] || "",
      language: book.language || "বাংলা", format: book.format || "PDF",
      published_date: book.published_date || "", tags: book.tags || [],
      outcomes: book.outcomes || [], suitable_for: book.suitable_for || [],
      chapters: (book.chapters as unknown as ChapterItem[]) || [],
      faq: (book.faq as unknown as FaqItem[]) || [],
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
      const { file_url, tags, outcomes, suitable_for, chapters, faq, ...rest } = form;
      const bookPayload = {
        ...rest,
        tags, outcomes, suitable_for,
        chapters: chapters as any,
        faq: faq as any,
      };
      let bookId = editingBook?.id;
      if (editingBook) {
        const { error } = await supabase.from("books").update(bookPayload).eq("id", editingBook.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("books").insert(bookPayload).select("id").single();
        if (error) throw error;
        bookId = data.id;
      }
      if (bookId && file_url) {
        await supabase.from("book_files").upsert({ book_id: bookId, file_url }, { onConflict: "book_id" });
      }
      toast({ title: editingBook ? "বই আপডেট হয়েছে" : "নতুন বই যোগ হয়েছে" });
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

  // Tag-like list helpers
  const addToList = (field: "tags" | "outcomes" | "suitable_for", value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setForm(f => ({ ...f, [field]: [...f[field], value.trim()] }));
    setter("");
  };
  const removeFromList = (field: "tags" | "outcomes" | "suitable_for", idx: number) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  };

  // Chapter helpers
  const addChapter = () => setForm(f => ({ ...f, chapters: [...f.chapters, { title: "", topics: [] }] }));
  const updateChapter = (idx: number, title: string) => {
    setForm(f => ({ ...f, chapters: f.chapters.map((c, i) => i === idx ? { ...c, title } : c) }));
  };
  const removeChapter = (idx: number) => setForm(f => ({ ...f, chapters: f.chapters.filter((_, i) => i !== idx) }));
  const addChapterTopic = (idx: number, topic: string) => {
    if (!topic.trim()) return;
    setForm(f => ({ ...f, chapters: f.chapters.map((c, i) => i === idx ? { ...c, topics: [...c.topics, topic.trim()] } : c) }));
  };
  const removeChapterTopic = (cIdx: number, tIdx: number) => {
    setForm(f => ({ ...f, chapters: f.chapters.map((c, i) => i === cIdx ? { ...c, topics: c.topics.filter((_, j) => j !== tIdx) } : c) }));
  };

  // FAQ helpers
  const addFaq = () => setForm(f => ({ ...f, faq: [...f.faq, { question: "", answer: "" }] }));
  const updateFaq = (idx: number, field: "question" | "answer", value: string) => {
    setForm(f => ({ ...f, faq: f.faq.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));
  };
  const removeFaq = (idx: number) => setForm(f => ({ ...f, faq: f.faq.filter((_, i) => i !== idx) }));

  const ListInput = ({ field, input, setInput, placeholder }: { field: "tags" | "outcomes" | "suitable_for"; input: string; setInput: (v: string) => void; placeholder: string }) => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList(field, input, setInput); } }} />
        <Button type="button" size="sm" variant="outline" onClick={() => addToList(field, input, setInput)}>যোগ</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {form[field].map((item, i) => (
          <span key={i} className="badge-pill bg-primary/10 text-primary text-xs flex items-center gap-1">
            {item}
            <button type="button" onClick={() => removeFromList(field, i)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-bengali text-foreground">বই ম্যানেজমেন্ট</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bengali"><Plus className="h-4 w-4" /> নতুন বই</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-bengali">{editingBook ? "বই সম্পাদনা" : "নতুন বই যোগ করুন"}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="font-bengali text-xs">মূল তথ্য</TabsTrigger>
                <TabsTrigger value="content" className="font-bengali text-xs">কন্টেন্ট</TabsTrigger>
                <TabsTrigger value="media" className="font-bengali text-xs">মিডিয়া</TabsTrigger>
                <TabsTrigger value="advanced" className="font-bengali text-xs">অন্যান্য</TabsTrigger>
              </TabsList>

              {/* BASIC */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="font-bengali">শিরোনাম *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">সাবটাইটেল</Label>
                    <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">স্লাগ (URL) *</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. my-book" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">লেখক *</Label>
                    <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">ক্যাটেগরি</Label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">মূল্য (৳) *</Label>
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
                  <div className="space-y-2">
                    <Label className="font-bengali">ভাষা</Label>
                    <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">ফরম্যাট</Label>
                    <Input value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} placeholder="PDF" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">প্রকাশের তারিখ</Label>
                    <Input value={form.published_date} onChange={(e) => setForm({ ...form, published_date: e.target.value })} placeholder="২০২৫" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="font-bengali">সংক্ষিপ্ত বিবরণ</Label>
                    <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="font-bengali">বিস্তারিত বিবরণ</Label>
                    <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  {/* Toggles */}
                  <div className="col-span-2 grid grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                      <Label className="font-bengali text-sm">ফিচার্ড</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={form.best_seller} onCheckedChange={(v) => setForm({ ...form, best_seller: v })} />
                      <Label className="font-bengali text-sm">বেস্টসেলার</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={form.new_release} onCheckedChange={(v) => setForm({ ...form, new_release: v })} />
                      <Label className="font-bengali text-sm">নতুন রিলিজ</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                      <Label className="font-bengali text-sm">সক্রিয়</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* CONTENT: outcomes, tags, suitable_for, chapters, FAQ */}
              <TabsContent value="content" className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="font-bengali font-semibold">ট্যাগ</Label>
                  <ListInput field="tags" input={tagInput} setInput={setTagInput} placeholder="ট্যাগ লিখে Enter চাপুন" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali font-semibold">এই বই পড়ে যা শিখবেন (Outcomes)</Label>
                  <ListInput field="outcomes" input={outcomeInput} setInput={setOutcomeInput} placeholder="একটি outcome লিখুন" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali font-semibold">কাদের জন্য উপযুক্ত</Label>
                  <ListInput field="suitable_for" input={suitableInput} setInput={setSuitableInput} placeholder="যেমন: নতুন উদ্যোক্তা" />
                </div>

                {/* Chapters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bengali font-semibold">অধ্যায়সমূহ</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addChapter} className="gap-1 font-bengali"><Plus className="h-3 w-3" /> অধ্যায়</Button>
                  </div>
                  {form.chapters.map((ch, cIdx) => (
                    <div key={cIdx} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input value={ch.title} onChange={(e) => updateChapter(cIdx, e.target.value)} placeholder={`অধ্যায় ${cIdx + 1} শিরোনাম`} className="flex-1" />
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeChapter(cIdx)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="pl-4 space-y-1">
                        {ch.topics.map((t, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-sm font-bengali flex-1">{t}</span>
                            <button type="button" onClick={() => removeChapterTopic(cIdx, tIdx)} className="text-destructive hover:text-destructive"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                        <Input placeholder="টপিক লিখে Enter চাপুন" className="text-sm h-8" onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); addChapterTopic(cIdx, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ""; }
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* FAQ */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bengali font-semibold">FAQ (সচরাচর জিজ্ঞাসা)</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addFaq} className="gap-1 font-bengali"><Plus className="h-3 w-3" /> প্রশ্ন</Button>
                  </div>
                  {form.faq.map((item, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input value={item.question} onChange={(e) => updateFaq(idx, "question", e.target.value)} placeholder="প্রশ্ন" className="flex-1" />
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeFaq(idx)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.answer} onChange={(e) => updateFaq(idx, "answer", e.target.value)} placeholder="উত্তর" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* MEDIA */}
              <TabsContent value="media" className="space-y-4 mt-4">
                <div className="space-y-2">
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
                    {form.cover_url && <img src={form.cover_url} alt="Cover" className="h-20 w-14 object-cover rounded-lg border border-border" />}
                  </div>
                  <Input placeholder="অথবা কভার URL পেস্ট করুন" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} className="text-xs" />
                </div>

                <div className="space-y-2">
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
              </TabsContent>

              {/* ADVANCED - just a placeholder info */}
              <TabsContent value="advanced" className="mt-4">
                <div className="text-sm text-muted-foreground font-bengali space-y-3">
                  <p>রিভিউ ম্যানেজ করতে সাইডবারের "রিভিউ" মেনু ব্যবহার করুন।</p>
                  <p>বই সেভ করার পর সব ডেটা ড্যাশবোর্ডে দেখা যাবে।</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="font-bengali">বাতিল</Button>
              <Button onClick={handleSave} className="font-bengali">{editingBook ? "আপডেট" : "যোগ করুন"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-brand-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <AdminTableContentSkeleton rows={6} columns={7} />
            </div>
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
                        <img src={book.cover_url} alt={book.title} className="h-10 w-8 object-cover rounded" loading="lazy" />
                      ) : (
                        <div className="h-10 w-8 bg-muted rounded flex items-center justify-center"><Image className="h-4 w-4 text-muted-foreground" /></div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-bengali font-medium">{book.title}</div>
                      <div className="text-xs text-muted-foreground">{book.category}</div>
                    </TableCell>
                    <TableCell className="font-bengali">{book.author}</TableCell>
                    <TableCell>
                      <div className="font-body font-semibold">৳{book.price}</div>
                      {book.original_price && book.original_price > book.price && (
                        <div className="text-xs text-muted-foreground line-through">৳{book.original_price}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {bookFiles[book.id] ? (
                        <span className="text-xs text-primary flex items-center gap-1"><FileText className="h-3 w-3" /> আছে</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">নেই</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={`badge-pill text-xs ${book.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {book.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </span>
                        <div className="flex gap-1">
                          {book.featured && <span className="text-[10px] badge-pill bg-secondary/10 text-secondary">ফিচার্ড</span>}
                          {book.best_seller && <span className="text-[10px] badge-pill bg-secondary/10 text-secondary">বেস্ট</span>}
                        </div>
                      </div>
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
