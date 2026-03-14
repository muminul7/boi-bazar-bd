import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminTableSkeleton } from "@/components/loading-skeletons";
import { Plus, Pencil, Trash2, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { Tables } from "@/integrations/supabase/types";

type Book = Tables<"books">;

interface Review {
  name: string;
  rating: number;
  comment: string;
  date?: string;
}

export default function AdminReviews() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState<Review>({
    name: "",
    rating: 5,
    comment: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("title");
    setBooks((data as Book[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      const book = books.find((b) => b.id === selectedBookId);
      const bookReviews = (book?.reviews as unknown as Review[] | null) || [];
      setReviews(bookReviews);
    } else {
      setReviews([]);
    }
  }, [selectedBookId, books]);

  const resetForm = () => {
    setForm({ name: "", rating: 5, comment: "", date: new Date().toISOString().split("T")[0] });
    setEditingIndex(null);
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (index: number) => {
    const review = reviews[index];
    setForm({ ...review, date: review.date || new Date().toISOString().split("T")[0] });
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const saveReviews = async (updatedReviews: Review[]) => {
    setSaving(true);
    try {
      // Calculate average rating
      const avgRating =
        updatedReviews.length > 0
          ? Math.round((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length) * 10) / 10
          : 0;

      const { error } = await supabase
        .from("books")
        .update({
          reviews: updatedReviews as any,
          rating: avgRating,
          review_count: updatedReviews.length,
        })
        .eq("id", selectedBookId);

      if (error) throw error;

      // Update local state
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBookId
            ? { ...b, reviews: updatedReviews as any, rating: avgRating, review_count: updatedReviews.length }
            : b
        )
      );
      setReviews(updatedReviews);
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.comment.trim()) {
      toast({ title: "নাম ও মন্তব্য আবশ্যক", variant: "destructive" });
      return;
    }

    const trimmedReview: Review = {
      name: form.name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
      date: form.date,
    };

    let updated: Review[];
    if (editingIndex !== null) {
      updated = reviews.map((r, i) => (i === editingIndex ? trimmedReview : r));
    } else {
      updated = [...reviews, trimmedReview];
    }

    await saveReviews(updated);
    setDialogOpen(false);
    resetForm();
    toast({ title: editingIndex !== null ? "রিভিউ আপডেট হয়েছে" : "রিভিউ যোগ হয়েছে" });
  };

  const handleDelete = async (index: number) => {
    if (!confirm("আপনি কি এই রিভিউ মুছতে চান?")) return;
    const updated = reviews.filter((_, i) => i !== index);
    await saveReviews(updated);
    toast({ title: "রিভিউ মুছে ফেলা হয়েছে" });
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
        </div>
        <Card className="shadow-brand-sm">
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          </CardContent>
        </Card>
        <AdminTableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-bengali text-foreground">রিভিউ ম্যানেজমেন্ট</h1>
      </div>

      {/* Book selector */}
      <Card className="shadow-brand-sm mb-6">
        <CardContent className="p-4">
          <Label className="font-bengali mb-2 block">বই সিলেক্ট করুন</Label>
          <Select value={selectedBookId} onValueChange={setSelectedBookId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="একটি বই বেছে নিন..." />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  <span className="font-bengali">{book.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(book.reviews as unknown as Review[] | null)?.length || 0} রিভিউ)
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Reviews list */}
      {selectedBookId && (
        <Card className="shadow-brand-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="font-bengali">
                <span className="font-semibold">{selectedBook?.title}</span>
                <span className="text-sm text-muted-foreground ml-3">
                  {reviews.length} টি রিভিউ • গড় রেটিং: {selectedBook?.rating || 0}
                </span>
              </div>
              <Button onClick={openAdd} className="gap-2 font-bengali" size="sm">
                <Plus className="h-4 w-4" /> রিভিউ যোগ করুন
              </Button>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-bengali">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                এই বইয়ে কোনো রিভিউ নেই। "রিভিউ যোগ করুন" বাটনে ক্লিক করুন।
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bengali">নাম</TableHead>
                    <TableHead className="font-bengali">রেটিং</TableHead>
                    <TableHead className="font-bengali">মন্তব্য</TableHead>
                    <TableHead className="font-bengali">তারিখ</TableHead>
                    <TableHead className="font-bengali text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-bengali font-medium">{review.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < review.rating ? "text-secondary fill-secondary" : "text-muted"}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-bengali max-w-xs truncate">{review.comment}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{review.date || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(index)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(index)}
                            className="text-destructive hover:text-destructive"
                          >
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
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali">
              {editingIndex !== null ? "রিভিউ সম্পাদনা" : "নতুন রিভিউ যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-bengali">পাঠকের নাম</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="যেমন: মোহাম্মদ রাকিব"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">রেটিং</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${star <= form.rating ? "text-secondary fill-secondary" : "text-muted"}`}
                    />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">{form.rating}/5</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">মন্তব্য</Label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="পাঠকের মন্তব্য লিখুন..."
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">তারিখ</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="font-bengali">
              বাতিল
            </Button>
            <Button onClick={handleSave} disabled={saving} className="font-bengali">
              {saving ? "সেভ হচ্ছে..." : editingIndex !== null ? "আপডেট" : "যোগ করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
