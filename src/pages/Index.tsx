import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle, Star, Shield, Zap, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { books, categories } from "@/data/books";
import BookCard from "@/components/BookCard";
import heroIllustration from "@/assets/hero-illustration.jpg";

// Stats
const stats = [
  { value: "৫,০০০+", label: "সন্তুষ্ট পাঠক" },
  { value: "১৫+", label: "প্রিমিয়াম বই" },
  { value: "৯৮%", label: "সাফল্যের হার" },
  { value: "৭ দিন", label: "মানি-ব্যাক গ্যারান্টি" },
];

// Benefits
const benefits = [
  { icon: BookOpen, title: "বিশেষজ্ঞের অভিজ্ঞতা", desc: "বাস্তব সফল উদ্যোক্তাদের কাছ থেকে শেখা জ্ঞান, শুধু থিওরি নয়।" },
  { icon: Zap, title: "তাৎক্ষণিক ডেলিভারি", desc: "পেমেন্ট করার সাথে সাথেই ইমেইলে PDF পাবেন। দেরি নেই।" },
  { icon: TrendingUp, title: "প্রমাণিত কৌশল", desc: "বাংলাদেশের বাজারে পরীক্ষিত এবং কার্যকর ব্যবসায়িক কৌশল।" },
  { icon: Shield, title: "৭ দিনের গ্যারান্টি", desc: "সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত। কোনো প্রশ্ন নেই।" },
  { icon: Users, title: "কমিউনিটি সাপোর্ট", desc: "প্রাইভেট Facebook গ্রুপে বিশেষজ্ঞদের সাথে যোগাযোগ করুন।" },
  { icon: CheckCircle, title: "আপডেট বিনামূল্যে", desc: "একবার কিনলেই পরবর্তী সব আপডেট বিনামূল্যে পাবেন।" },
];

// Testimonials
const testimonials = [
  { name: "তানভীর হাসান", role: "ফ্যাশন ই-কমার্স মালিক, ঢাকা", rating: 5, text: "এই বইগুলো আমার ব্যবসাকে আমূল বদলে দিয়েছে। প্রথম মাসেই বিক্রি ৩ গুণ বেড়েছে।", avatar: "ত" },
  { name: "সুমাইয়া বেগম", role: "অনলাইন উদ্যোক্তা, চট্টগ্রাম", rating: 5, text: "গৃহিণী হয়েও এখন মাসে ৮০,০০০ টাকা আয় করছি। সব কিছু এই বই থেকে শেখা।", avatar: "সু" },
  { name: "রাহুল দাস", role: "ড্রপশিপিং উদ্যোক্তা, সিলেট", rating: 5, text: "মাত্র ৩ মাসে ১ লক্ষ টাকা আয়ের স্বপ্ন বাস্তবে পরিণত হয়েছে। অবিশ্বাস্য!", avatar: "রা" },
];

export default function HomePage() {
  const featuredBooks = books.filter((b) => b.featured);
  const bestSellers = books.filter((b) => b.bestSeller);

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-hero">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-10" style={{ background: "hsl(39, 88%, 52%)" }} />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full opacity-10" style={{ background: "hsl(174, 65%, 40%)" }} />

        <div className="container mx-auto py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="text-primary-foreground animate-slide-up">
              <div className="inline-flex items-center gap-2 mb-5 rounded-full px-4 py-1.5 text-sm font-bengali border" style={{ background: "hsl(0, 0%, 100%, 0.1)", borderColor: "hsl(0, 0%, 100%, 0.2)" }}>
                <span className="text-gold">✦</span> বাংলাদেশের #১ ই-বুক স্টোর
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-bengali leading-tight mb-5">
                আপনার ই-কমার্স ব্যবসাকে{" "}
                <span className="text-gradient-gold">পরবর্তী স্তরে</span>{" "}
                নিয়ে যান
              </h1>
              <p className="text-lg font-bengali leading-relaxed mb-8" style={{ color: "hsl(0, 0%, 100%, 0.8)" }}>
                বাংলাদেশের শীর্ষ উদ্যোক্তাদের তৈরি প্রিমিয়াম গাইড। শূন্য থেকে শুরু করে মাসে লক্ষ টাকা আয়ের রোডম্যাপ।
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/books">
                  <Button size="lg" className="gap-2 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali text-base shadow-gold animate-pulse-gold">
                    বই দেখুন <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a href="#benefits">
                  <Button size="lg" variant="outline" className="font-bengali text-base border-white/30 hover:bg-white/10" style={{ color: "hsl(0, 0%, 100%)" }}>
                    আরও জানুন
                  </Button>
                </a>
              </div>

              {/* Mini stats */}
              <div className="mt-10 flex flex-wrap gap-6">
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold font-body text-gold">{s.value}</div>
                    <div className="text-sm font-bengali" style={{ color: "hsl(0, 0%, 100%, 0.7)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="relative animate-scale-in hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-brand-xl">
                <img src={heroIllustration} alt="Bengali ecommerce entrepreneur" className="w-full h-auto" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-6 bg-card rounded-xl p-3 shadow-brand-lg border border-border flex items-center gap-2.5 animate-float">
                <div className="h-10 w-10 rounded-full bg-secondary-subtle flex items-center justify-center">
                  <Star className="h-5 w-5 text-gold fill-current" />
                </div>
                <div>
                  <div className="text-sm font-bold font-body text-foreground">৪.৯/৫</div>
                  <div className="text-xs text-muted-foreground font-bengali">৫০০+ রিভিউ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-primary py-5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label} className="text-primary-foreground">
                <div className="text-2xl font-bold font-body">{s.value}</div>
                <div className="text-sm font-bengali opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED BOOKS ─── */}
      <section className="section-py bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary font-bengali mb-2">বিশেষ সংগ্রহ</p>
            <h2 className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-3">ফিচার্ড বই সমূহ</h2>
            <p className="text-muted-foreground font-bengali max-w-xl mx-auto">আমাদের পাঠকদের সবচেয়ে প্রিয় এবং সর্বাধিক বিক্রিত বইগুলো</p>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                to={cat === "সব বই" ? "/books" : `/books?category=${encodeURIComponent(cat)}`}
                className="badge-pill bg-muted text-muted-foreground hover:bg-primary-subtle hover:text-primary transition-colors cursor-pointer border border-border hover:border-primary"
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/books">
              <Button size="lg" variant="outline" className="gap-2 border-primary text-primary hover:bg-primary-subtle font-bengali">
                সব বই দেখুন <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section id="benefits" className="section-py bg-gradient-section">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary font-bengali mb-2">কেন একিতাব?</p>
            <h2 className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-3">আমাদের সুবিধাসমূহ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-6 border border-border shadow-brand-sm hover:shadow-brand-md transition-shadow hover-lift"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle mb-4">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bengali font-bold text-foreground text-lg mb-2">{b.title}</h3>
                <p className="text-muted-foreground font-bengali text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BESTSELLERS ─── */}
      {bestSellers.length > 0 && (
        <section className="section-py bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-gold font-bengali mb-2">পাঠকদের পছন্দ</p>
              <h2 className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-3">বেস্টসেলার বই</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bestSellers.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TESTIMONIALS ─── */}
      <section className="section-py bg-primary">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-gold font-bengali mb-2">তাদের সাফল্যের গল্প</p>
            <h2 className="text-3xl lg:text-4xl font-bold font-bengali text-primary-foreground mb-3">পাঠকরা কী বলছেন</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-brand-lg">
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-gold fill-current" />
                  ))}
                </div>
                <p className="font-bengali text-sm leading-relaxed text-muted-foreground mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm font-bengali">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold font-bengali text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground font-bengali">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="section-py bg-background">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-3xl p-10 lg:p-16 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-10" style={{ background: "hsl(39, 88%, 52%)" }} />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold font-bengali mb-4">
                আজই শুরু করুন আপনার সফলতার যাত্রা
              </h2>
              <p className="text-lg font-bengali mb-8 max-w-xl mx-auto" style={{ color: "hsl(0, 0%, 100%, 0.8)" }}>
                হাজার হাজার উদ্যোক্তার মতো আপনিও পরিবর্তন আনুন। প্রথম পদক্ষেপটা এখনই নিন।
              </p>
              <Link to="/books">
                <Button size="lg" className="gap-2 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali text-base shadow-gold">
                  এখনই বই কিনুন <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
