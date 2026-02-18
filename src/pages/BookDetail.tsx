import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Star, Shield, Download, Clock, FileText, CheckCircle, ChevronDown,
  ChevronUp, ArrowLeft, ShoppingCart, Gift, BookOpen, Users, Award, Zap,
} from "lucide-react";
import { books } from "@/data/books";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard";
import CheckoutModal from "@/components/CheckoutModal";

export default function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const book = books.find((b) => b.slug === slug);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold font-bengali">বইটি পাওয়া যায়নি</h2>
        <Link to="/books">
          <Button variant="outline" className="font-bengali">স্টোরে ফিরুন</Button>
        </Link>
      </div>
    );
  }

  const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
  const relatedBooks = books.filter((b) => b.id !== book.id && b.category === book.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto py-3 flex items-center gap-2 text-sm font-bengali text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
          <span>/</span>
          <Link to="/books" className="hover:text-primary transition-colors">বই স্টোর</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{book.title}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Book Cover — sticky on desktop */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              {/* Cover image */}
              <div className="relative rounded-2xl overflow-hidden shadow-book mb-5">
                <img src={book.cover} alt={book.title} className="w-full object-cover" />
                {book.bestSeller && (
                  <div className="absolute top-3 left-3">
                    <span className="badge-pill bg-secondary text-secondary-foreground gap-1 flex items-center text-xs">
                      <Award className="h-3 w-3" /> বেস্টসেলার
                    </span>
                  </div>
                )}
              </div>

              {/* Buy Box */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-brand-md">
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-bold font-body text-primary">৳{book.price}</span>
                  {book.originalPrice > book.price && (
                    <span className="text-lg text-muted-foreground line-through font-body">৳{book.originalPrice}</span>
                  )}
                  {discount > 0 && (
                    <span className="badge-pill bg-destructive text-destructive-foreground text-xs font-body">
                      {discount}% ছাড়
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-bengali mb-4">একবার কিনুন, আজীবন পড়ুন</p>

                <Button
                  className="w-full gap-2 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali text-base mb-3 shadow-gold py-6"
                  onClick={() => setCheckoutOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  এখনই কিনুন
                </Button>

                {/* Delivery info */}
                <div className="space-y-2.5 text-sm font-bengali">
                  {[
                    { icon: Download, text: "পেমেন্টের পরপরই ডাউনলোড লিংক ইমেইলে" },
                    { icon: FileText, text: `${book.pages} পৃষ্ঠার PDF ফরম্যাট` },
                    { icon: Clock, text: "৪৮ ঘণ্টার ডাউনলোড মেয়াদ" },
                    { icon: Shield, text: "৭ দিনের সম্পূর্ণ মানি-ব্যাক গ্যারান্টি" },
                    { icon: Zap, text: "বিনামূল্যে ভবিষ্যৎ আপডেট" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-muted-foreground">
                      <item.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon hint */}
                <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-secondary-subtle border border-secondary/30">
                  <Gift className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-xs font-bengali text-secondary-foreground">কুপন কোড থাকলে চেকআউটে দিন</span>
                </div>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Title block */}
            <div>
              <span className="badge-pill bg-primary-subtle text-primary text-xs mb-3 inline-block">{book.category}</span>
              <h1 className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-2 leading-snug">{book.title}</h1>
              <p className="text-lg text-muted-foreground font-bengali mb-4">{book.subtitle}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className={`h-4 w-4 ${i <= Math.round(book.rating) ? "text-gold fill-current" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <span className="font-bold font-body text-foreground">{book.rating}</span>
                  <span className="text-muted-foreground font-bengali">({book.reviewCount} রিভিউ)</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="font-bengali text-muted-foreground">লেখক: <strong className="text-foreground">{book.author}</strong></span>
                <span className="text-muted-foreground">•</span>
                <span className="font-bengali text-muted-foreground">{book.pages} পৃষ্ঠা</span>
              </div>
            </div>

            {/* Short description */}
            <div className="bg-primary-subtle rounded-xl p-5 border border-primary/20">
              <p className="font-bengali text-foreground leading-relaxed">{book.description}</p>
            </div>

            {/* Key Outcomes */}
            <div>
              <h2 className="text-xl font-bold font-bengali text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" /> এই বই পড়ে আপনি যা করতে পারবেন
              </h2>
              <ul className="space-y-3">
                {book.outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="font-bengali text-foreground">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You'll Learn / Chapters */}
            <div>
              <h2 className="text-xl font-bold font-bengali text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> বিষয়সূচি
              </h2>
              <div className="space-y-3">
                {book.chapters.map((chapter, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold font-body shrink-0">
                        {i + 1}
                      </span>
                      <h4 className="font-bengali font-semibold text-foreground">{chapter.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5 ml-9">
                      {chapter.topics.map((topic, j) => (
                        <span key={j} className="badge-pill bg-muted text-muted-foreground text-xs">{topic}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suitable For */}
            <div>
              <h2 className="text-xl font-bold font-bengali text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> এই বই কাদের জন্য
              </h2>
              <div className="flex flex-wrap gap-2">
                {book.suitableFor.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border shadow-brand-sm">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bengali text-sm text-foreground">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee Block */}
            <div className="bg-gradient-hero rounded-2xl p-6 text-primary-foreground">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Shield className="h-7 w-7 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-bengali font-bold text-lg mb-1">৭ দিনের মানি-ব্যাক গ্যারান্টি</h3>
                  <p className="font-bengali text-sm opacity-90">
                    বই পড়ার পর যদি মনে করেন আপনার কাজে আসেনি, তাহলে ৭ দিনের মধ্যে জানান। সম্পূর্ণ টাকা ফেরত দেওয়া হবে — কোনো প্রশ্ন ছাড়াই।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold font-bengali text-foreground mb-6">পাঠকদের রিভিউ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {book.reviews.map((review, i) => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border shadow-brand-sm">
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map((j) => (
                    <Star key={j} className={`h-4 w-4 ${j <= review.rating ? "text-gold fill-current" : "text-muted-foreground"}`} />
                  ))}
                  {review.verified && (
                    <span className="ml-2 text-xs font-bengali text-primary flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> যাচাইকৃত
                    </span>
                  )}
                </div>
                <p className="font-bengali text-sm text-muted-foreground leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm font-bengali">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="font-semibold font-bengali text-foreground text-sm">{review.name}</div>
                    <div className="text-xs text-muted-foreground font-bengali">{review.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold font-bengali text-foreground mb-6">সাধারণ প্রশ্নোত্তর</h2>
        <div className="space-y-3 max-w-2xl">
          {book.faq.map((item, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left gap-4"
                onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
              >
                <span className="font-bengali font-semibold text-foreground">{item.question}</span>
                {openFaqIdx === i ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {openFaqIdx === i && (
                <div className="px-5 pb-5 border-t border-border">
                  <p className="font-bengali text-muted-foreground leading-relaxed pt-3">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── RELATED BOOKS ─── */}
      {relatedBooks.length > 0 && (
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold font-bengali text-foreground mb-6">সম্পর্কিত বই</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBooks.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── STICKY BUY BAR (mobile) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card border-t border-border p-3 flex items-center gap-3 shadow-brand-xl">
        <div>
          <div className="text-xl font-bold font-body text-primary">৳{book.price}</div>
          {book.originalPrice > book.price && (
            <div className="text-xs text-muted-foreground line-through font-body">৳{book.originalPrice}</div>
          )}
        </div>
        <Button
          className="flex-1 gap-2 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali shadow-gold"
          onClick={() => setCheckoutOpen(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          এখনই কিনুন
        </Button>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} book={book} />
    </div>
  );
}
