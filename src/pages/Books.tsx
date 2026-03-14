import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, TrendingUp, Zap } from "lucide-react";
import { useBooks } from "@/hooks/useBooks";
import BookCard from "@/components/BookCard";
import { BooksPageSkeleton } from "@/components/loading-skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "bestseller" | "newest" | "price-low" | "price-high";

export default function BooksPage() {
  const { data: books = [], isLoading } = useBooks();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব বই");
  const [filter, setFilter] = useState<FilterType>("all");

  const categories = useMemo(() => {
    const cats = new Set(books.map((b) => b.category).filter(Boolean));
    return ["সব বই", ...Array.from(cats)];
  }, [books]);

  const filtered = useMemo(() => {
    let result = [...books];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.subtitle.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "সব বই") {
      result = result.filter((b) => b.category === selectedCategory);
    }
    switch (filter) {
      case "bestseller":
        result = result.filter((b) => b.bestSeller);
        break;
      case "newest":
        result = result.filter((b) => b.newRelease);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
    }
    return result;
  }, [books, search, selectedCategory, filter]);

  const filterOptions: { key: FilterType; label: string; icon?: React.ReactNode }[] = [
    { key: "all", label: "সব" },
    { key: "bestseller", label: "বেস্টসেলার", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "newest", label: "নতুন", icon: <Zap className="h-3.5 w-3.5" /> },
    { key: "price-low", label: "কম দামে" },
    { key: "price-high", label: "বেশি দামে" },
  ];

  if (isLoading) {
    return <BooksPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-12">
        <div className="container mx-auto text-center">
          <p className="text-sm font-bengali mb-2 text-gold font-semibold">প্রিমিয়াম সংগ্রহ</p>
          <h1 className="text-3xl lg:text-4xl font-bold font-bengali text-primary-foreground mb-3">বই স্টোর</h1>
          <p className="text-primary-foreground/80 font-bengali max-w-lg mx-auto">
            বাংলাদেশের সেরা ই-কমার্স গাইড বইয়ের সংগ্রহ। আপনার পছন্দের বিষয় বেছে নিন।
          </p>
        </div>
      </div>

      <div className="container mx-auto py-10">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="বই খুঁজুন..."
              className="pl-10 font-bengali bg-card border-border focus:border-primary"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-bengali">
              <SlidersHorizontal className="h-4 w-4" />
              <span>ফিল্টার:</span>
            </div>
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`flex items-center gap-1.5 badge-pill text-sm transition-all ${
                  filter === opt.key
                    ? "bg-primary text-primary-foreground shadow-teal"
                    : "bg-muted text-muted-foreground hover:bg-primary-subtle hover:text-primary"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-8 pb-3 border-b border-border">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`badge-pill text-sm transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-teal"
                  : "bg-card text-muted-foreground border border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground font-bengali mb-6">
          {filtered.length} টি বই পাওয়া গেছে
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bengali font-bold text-foreground text-xl mb-2">কোনো বই পাওয়া যায়নি</h3>
            <p className="font-bengali text-muted-foreground mb-4">অন্য কীওয়ার্ড বা ক্যাটাগরি দিয়ে খুঁজুন।</p>
            <Button
              variant="outline"
              onClick={() => { setSearch(""); setSelectedCategory("সব বই"); setFilter("all"); }}
              className="font-bengali border-primary text-primary hover:bg-primary-subtle"
            >
              ফিল্টার রিসেট করুন
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
