import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  Star, Shield, Download, Clock, FileText, CheckCircle, ChevronDown,
  ChevronUp, ShoppingCart, Gift, BookOpen, Users, Award, Zap,
  Eye, Sparkles, Heart, Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import { books } from "@/data/books";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard";
import CheckoutModal from "@/components/CheckoutModal";
import BookPreviewReader from "@/components/BookPreviewReader";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const book = books.find((b) => b.slug === slug);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
      {/* Hero breadcrumb bar */}
      <div className="bg-gradient-hero">
        <div className="container mx-auto py-4 flex items-center gap-2 text-sm font-bengali text-primary-foreground/70">
          <Link to="/" className="hover:text-primary-foreground transition-colors">হোম</Link>
          <span>/</span>
          <Link to="/books" className="hover:text-primary-foreground transition-colors">বই স্টোর</Link>
          <span>/</span>
          <span className="text-primary-foreground truncate max-w-xs">{book.title}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Book Cover — sticky */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sticky top-24 space-y-5">
              {/* Cover */}
              <div className="relative rounded-2xl overflow-hidden shadow-brand-xl group">
                <img src={book.cover} alt={book.title} className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {book.bestSeller && (
                    <span className="badge-pill bg-secondary text-secondary-foreground gap-1 flex items-center text-xs shadow-gold">
                      <Award className="h-3 w-3" /> বেস্টসেলার
                    </span>
                  )}
                  {book.newRelease && (
                    <span className="badge-pill bg-primary text-primary-foreground gap-1 flex items-center text-xs">
                      <Zap className="h-3 w-3" /> নতুন
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <div className="absolute top-3 right-3">
                    <div className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center text-xs font-bold text-destructive-foreground font-body shadow-lg">
                      -{discount}%
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Button */}
              {book.previewPages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2.5 font-bengali text-base border-primary text-primary hover:bg-primary-subtle py-5 rounded-xl"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Eye className="h-5 w-5" />
                    ফ্রি প্রিভিউ পড়ুন ({book.previewPages.length} পৃষ্ঠা)
                  </Button>
                </motion.div>
              )}

              {/* Buy Box */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-brand-lg">
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
                  className="w-full gap-2 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali text-base mb-3 shadow-gold py-6 rounded-xl"
                  onClick={() => setCheckoutOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  এখনই কিনুন
                </Button>

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

                <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-secondary-subtle border border-secondary/30">
                  <Gift className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-xs font-bengali text-secondary-foreground">কুপন কোড থাকলে চেকআউটে দিন</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Book Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Title block */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-pill bg-primary-subtle text-primary text-xs">{book.category}</span>
                <span className="badge-pill bg-muted text-muted-foreground text-xs">{book.format}</span>
                <span className="badge-pill bg-muted text-muted-foreground text-xs">{book.language}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-2 leading-snug">{book.title}</h1>
              <p className="text-lg text-muted-foreground font-bengali mb-4">{book.subtitle}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className={`h-4 w-4 ${i <= Math.round(book.rating) ? "star-filled fill-current" : "star-empty"}`} />
                    ))}
                  </div>
                  <span className="font-bold font-body text-foreground">{book.rating}</span>
                  <span className="text-muted-foreground font-bengali">({book.reviewCount} রিভিউ)</span>
                </div>
                <span className="text-border">•</span>
                <span className="font-bengali text-muted-foreground">লেখক: <strong className="text-foreground">{book.author}</strong></span>
                <span className="text-border">•</span>
                <span className="font-bengali text-muted-foreground">{book.pages} পৃষ্ঠা</span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="relative bg-primary-subtle rounded-2xl p-6 border border-primary/20 overflow-hidden"
            >
              <Sparkles className="absolute top-4 right-4 h-5 w-5 text-primary/30" />
              <p className="font-bengali text-foreground leading-relaxed">{book.description}</p>
            </motion.div>

            {/* Stats bar */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { label: "পৃষ্ঠা", value: book.pages.toString(), icon: FileText },
                { label: "রিভিউ", value: book.reviewCount.toString(), icon: Heart },
                { label: "রেটিং", value: book.rating.toString(), icon: Star },
              ].map((stat, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 text-center shadow-brand-sm">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold font-body text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-bengali">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Key Outcomes */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <h2 className="text-xl font-bold font-bengali text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" /> এই বই পড়ে আপনি যা করতে পারবেন
              </h2>
              <ul className="space-y-3">
                {book.outcomes.map((outcome, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3 bg-card rounded-xl p-3.5 border border-border shadow-brand-sm hover-lift"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <span className="font-bengali text-foreground">{outcome}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Chapters */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
              <h2 className="text-xl font-bold font-bengali text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> বিষয়সূচি
              </h2>
              <div className="space-y-3">
                {book.chapters.map((chapter, i) => (
                  <motion.div
                    key={i}
                    className="bg-card rounded-xl border border-border p-4 hover-lift"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="h-7 w-7 rounded-lg bg-gradient-hero text-primary-foreground text-xs flex items-center justify-center font-bold font-body shrink-0">
                        {i + 1}
                      </span>
                      <h4 className="font-bengali font-semibold text-foreground">{chapter.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5 ml-10">
                      {chapter.topics.map((topic, j) => (
                        <span key={j} className="badge-pill bg-muted text-muted-foreground text-xs border border-border">{topic}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Suitable For */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
              <h2 className="text-xl font-bold font-bengali text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> এই বই কাদের জন্য
              </h2>
              <div className="flex flex-wrap gap-2">
                {book.suitableFor.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-card rounded-full px-4 py-2.5 border border-border shadow-brand-sm hover-lift">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bengali text-sm text-foreground">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Guarantee Block */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={6}
              className="bg-gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/10" />
              <div className="relative flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-gold">
                  <Shield className="h-7 w-7 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-bengali font-bold text-lg mb-1">৭ দিনের মানি-ব্যাক গ্যারান্টি</h3>
                  <p className="font-bengali text-sm opacity-90">
                    বই পড়ার পর যদি মনে করেন আপনার কাজে আসেনি, তাহলে ৭ দিনের মধ্যে জানান। সম্পূর্ণ টাকা ফেরত দেওয়া হবে — কোনো প্রশ্ন ছাড়াই।
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold font-bengali text-foreground mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-gold" /> পাঠকদের রিভিউ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {book.reviews.map((review, i) => (
              <motion.div
                key={i}
                className="bg-card rounded-2xl p-5 border border-border shadow-brand-sm hover-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map((j) => (
                    <Star key={j} className={`h-4 w-4 ${j <= review.rating ? "star-filled fill-current" : "star-empty"}`} />
                  ))}
                  {review.verified && (
                    <span className="ml-2 text-xs font-bengali text-primary flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> যাচাইকৃত
                    </span>
                  )}
                </div>
                <p className="font-bengali text-sm text-muted-foreground leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm font-bengali">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="font-semibold font-bengali text-foreground text-sm">{review.name}</div>
                    <div className="text-xs text-muted-foreground font-bengali">{review.date}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold font-bengali text-foreground mb-6">সাধারণ প্রশ্নোত্তর</h2>
        <div className="space-y-3 max-w-2xl">
          {book.faq.map((item, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-xl border border-border overflow-hidden hover-lift"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left gap-4"
                onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
              >
                <span className="font-bengali font-semibold text-foreground">{item.question}</span>
                {openFaqIdx === i ? (
                  <ChevronUp className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {openFaqIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-5 border-t border-border"
                >
                  <p className="font-bengali text-muted-foreground leading-relaxed pt-3">{item.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Related Books */}
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

      {/* Sticky mobile buy bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-md border-t border-border p-3 flex items-center gap-3 shadow-brand-xl">
        <div>
          <div className="text-xl font-bold font-body text-primary">৳{book.price}</div>
          {book.originalPrice > book.price && (
            <div className="text-xs text-muted-foreground line-through font-body">৳{book.originalPrice}</div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 font-bengali border-primary text-primary"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="h-4 w-4" />
          প্রিভিউ
        </Button>
        <Button
          className="flex-1 gap-2 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali shadow-gold"
          onClick={() => setCheckoutOpen(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          এখনই কিনুন
        </Button>
      </div>

      {/* Modals */}
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} book={book} />
      <BookPreviewReader
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pages={book.previewPages}
        bookTitle={book.title}
        totalPages={book.pages}
        onBuyClick={() => {
          setPreviewOpen(false);
          setCheckoutOpen(true);
        }}
      />
    </div>
  );
}
