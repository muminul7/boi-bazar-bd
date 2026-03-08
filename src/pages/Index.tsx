import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle, Star, Shield, Zap, TrendingUp, Users, Sparkles, Download, Heart, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { books, categories } from "@/data/books";
import BookCard from "@/components/BookCard";
import heroIllustration from "@/assets/hero-illustration.jpg";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const stats = [
  { value: "৫,০০০+", label: "সন্তুষ্ট পাঠক", icon: Users },
  { value: "১৫+", label: "প্রিমিয়াম বই", icon: BookOpen },
  { value: "৯৮%", label: "সাফল্যের হার", icon: TrendingUp },
  { value: "৭ দিন", label: "মানি-ব্যাক গ্যারান্টি", icon: Shield },
];

const benefits = [
  { icon: BookOpen, title: "বিশেষজ্ঞের অভিজ্ঞতা", desc: "বাস্তব সফল উদ্যোক্তাদের কাছ থেকে শেখা জ্ঞান, শুধু থিওরি নয়।", color: "bg-primary/10 text-primary" },
  { icon: Zap, title: "তাৎক্ষণিক ডেলিভারি", desc: "পেমেন্ট করার সাথে সাথেই ইমেইলে PDF পাবেন। দেরি নেই।", color: "bg-secondary/10 text-secondary" },
  { icon: TrendingUp, title: "প্রমাণিত কৌশল", desc: "বাংলাদেশের বাজারে পরীক্ষিত এবং কার্যকর ব্যবসায়িক কৌশল।", color: "bg-primary/10 text-primary" },
  { icon: Shield, title: "৭ দিনের গ্যারান্টি", desc: "সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত। কোনো প্রশ্ন নেই।", color: "bg-destructive/10 text-destructive" },
  { icon: Users, title: "কমিউনিটি সাপোর্ট", desc: "প্রাইভেট Facebook গ্রুপে বিশেষজ্ঞদের সাথে যোগাযোগ করুন।", color: "bg-secondary/10 text-secondary" },
  { icon: Download, title: "আপডেট বিনামূল্যে", desc: "একবার কিনলেই পরবর্তী সব আপডেট বিনামূল্যে পাবেন।", color: "bg-primary/10 text-primary" },
];

const testimonials = [
  { name: "তানভীর হাসান", role: "ফ্যাশন ই-কমার্স মালিক, ঢাকা", rating: 5, text: "এই বইগুলো আমার ব্যবসাকে আমূল বদলে দিয়েছে। প্রথম মাসেই বিক্রি ৩ গুণ বেড়েছে।", avatar: "ত" },
  { name: "সুমাইয়া বেগম", role: "অনলাইন উদ্যোক্তা, চট্টগ্রাম", rating: 5, text: "গৃহিণী হয়েও এখন মাসে ৮০,০০০ টাকা আয় করছি। সব কিছু এই বই থেকে শেখা।", avatar: "সু" },
  { name: "রাহুল দাস", role: "ড্রপশিপিং উদ্যোক্তা, সিলেট", rating: 5, text: "মাত্র ৩ মাসে ১ লক্ষ টাকা আয়ের স্বপ্ন বাস্তবে পরিণত হয়েছে। অবিশ্বাস্য!", avatar: "রা" },
];

const steps = [
  { num: "১", title: "বই বেছে নিন", desc: "আপনার প্রয়োজন অনুযায়ী সেরা গাইড বাছাই করুন" },
  { num: "২", title: "পেমেন্ট করুন", desc: "বিকাশ, নগদ, কার্ড — যেকোনো পদ্ধতিতে পে করুন" },
  { num: "৩", title: "ডাউনলোড করুন", desc: "ইমেইলে তাৎক্ষণিক ডাউনলোড লিংক পান" },
  { num: "৪", title: "সফল হন", desc: "প্রমাণিত কৌশল প্রয়োগ করে আয় শুরু করুন" },
];

export default function HomePage() {
  const featuredBooks = books.filter((b) => b.featured);
  const bestSellers = books.filter((b) => b.bestSeller);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[90vh] flex items-center">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, hsl(39, 88%, 52%), transparent 70%)" }} />
          <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(174, 65%, 60%), transparent 70%)" }} />
          <div className="absolute -bottom-20 right-1/3 h-[300px] w-[300px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(0, 0%, 100%), transparent 70%)" }} />
        </div>

        <div className="container mx-auto py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="text-primary-foreground">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 mb-6 rounded-full px-5 py-2 text-sm font-bengali glass">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>বাংলাদেশের #১ ই-বুক স্টোর</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl lg:text-5xl xl:text-[3.5rem] font-bold font-bengali leading-[1.2] mb-6">
                আপনার ই-কমার্স ব্যবসাকে{" "}
                <span className="relative inline-block">
                  <span className="text-gradient-gold">পরবর্তী স্তরে</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M1 5.5C40 2 80 1 100 3C120 5 160 6 199 2.5" stroke="hsl(39, 88%, 52%)" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                নিয়ে যান
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg lg:text-xl font-bengali leading-relaxed mb-8 opacity-85">
                বাংলাদেশের শীর্ষ উদ্যোক্তাদের তৈরি প্রিমিয়াম গাইড। শূন্য থেকে শুরু করে মাসে লক্ষ টাকা আয়ের রোডম্যাপ।
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3">
                <Link to="/books">
                  <Button size="lg" className="gap-2.5 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali text-base shadow-gold px-8 py-6 rounded-xl">
                    বই দেখুন <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="font-bengali text-base glass border-white/20 hover:bg-white/15 px-8 py-6 rounded-xl" style={{ color: "hsl(0, 0%, 100%)" }}>
                    কিভাবে কাজ করে?
                  </Button>
                </a>
              </motion.div>

              {/* Mini trust badges */}
              <motion.div variants={fadeUp} custom={4} className="mt-12 flex flex-wrap gap-8">
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl glass flex items-center justify-center">
                      <s.icon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <div className="text-xl font-bold font-body text-gold">{s.value}</div>
                      <div className="text-xs font-bengali opacity-70">{s.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Glow behind image */}
                <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(circle at center, hsl(39, 88%, 52%, 0.15), transparent 70%)", transform: "scale(1.1)" }} />
                <div className="rounded-3xl overflow-hidden shadow-brand-xl border-2 border-white/10">
                  <img src={heroIllustration} alt="Bengali ecommerce entrepreneur" className="w-full h-auto" />
                </div>
              </div>

              {/* Floating card - Rating */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-6 -left-8 bg-card rounded-2xl p-4 shadow-brand-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-secondary/15 flex items-center justify-center">
                    <Star className="h-6 w-6 text-gold fill-current" />
                  </div>
                  <div>
                    <div className="text-lg font-bold font-body text-foreground">৪.৯/৫</div>
                    <div className="text-xs text-muted-foreground font-bengali">৫০০+ রিভিউ</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating card - Downloads */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -top-4 -right-6 bg-card rounded-2xl p-4 shadow-brand-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold font-body text-foreground">৫,০০০+</div>
                    <div className="text-xs text-muted-foreground font-bengali">ডাউনলোড</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative -mt-1 bg-card border-y border-border">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center flex flex-col items-center gap-2"
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold font-body text-foreground">{s.value}</div>
                <div className="text-sm font-bengali text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED BOOKS ─── */}
      <section className="section-py bg-background">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary font-bengali mb-2 tracking-wide uppercase">বিশেষ সংগ্রহ</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-4">ফিচার্ড বই সমূহ</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground font-bengali max-w-xl mx-auto text-lg">আমাদের পাঠকদের সবচেয়ে প্রিয় এবং সর্বাধিক বিক্রিত বইগুলো</motion.p>
          </motion.div>

          {/* Category chips */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                to={cat === "সব বই" ? "/books" : `/books?category=${encodeURIComponent(cat)}`}
                className="badge-pill bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border border-border hover:border-primary hover:shadow-teal"
              >
                {cat}
              </Link>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
            <Link to="/books">
              <Button size="lg" variant="outline" className="gap-2.5 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bengali px-8 py-6 rounded-xl transition-all">
                সব বই দেখুন <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="section-py bg-card border-y border-border">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-secondary font-bengali mb-2">সহজ ৪ ধাপ</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-foreground">কিভাবে কাজ করে?</motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center group"
              >
                <div className="relative inline-flex mb-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold font-body shadow-teal group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}
                <h3 className="font-bengali font-bold text-foreground text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground font-bengali text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section id="benefits" className="section-py bg-background">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary font-bengali mb-2">কেন একিতাব?</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-4">আমাদের সুবিধাসমূহ</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-card rounded-2xl p-7 border border-border shadow-brand-sm hover:shadow-brand-lg transition-all duration-300 hover-lift group"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-5 ${b.color} transition-transform group-hover:scale-110`}>
                  <b.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bengali font-bold text-foreground text-lg mb-2">{b.title}</h3>
                <p className="text-muted-foreground font-bengali text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BESTSELLERS ─── */}
      {bestSellers.length > 0 && (
        <section className="section-py bg-card border-y border-border">
          <div className="container mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
              <motion.p variants={fadeUp} className="text-sm font-semibold text-gold font-bengali mb-2">🏆 পাঠকদের পছন্দ</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-foreground">বেস্টসেলার বই</motion.h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              {bestSellers.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TESTIMONIALS ─── */}
      <section className="section-py bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(39, 88%, 52%), transparent 70%)" }} />
        </div>
        <div className="container mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-gold font-bengali mb-2">তাদের সাফল্যের গল্প</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-primary-foreground">পাঠকরা কী বলছেন</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-card rounded-2xl p-7 shadow-brand-xl relative group hover-lift"
              >
                <Quote className="absolute top-5 right-5 h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-gold fill-current" />
                  ))}
                </div>
                <p className="font-bengali text-sm leading-relaxed text-muted-foreground mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm font-bengali">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold font-bengali text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground font-bengali">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BANNER ─── */}
      <section className="bg-secondary py-6">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <Heart className="h-6 w-6 text-secondary-foreground animate-pulse" />
            <p className="font-bengali font-semibold text-secondary-foreground text-lg">
              <span className="font-body">৫,০০০+</span> উদ্যোক্তা ইতোমধ্যে তাদের ব্যবসা বদলে ফেলেছেন একিতাবের সাথে
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="section-py bg-background">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-hero rounded-3xl p-10 lg:p-20 text-center text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, hsl(39, 88%, 52%), transparent 70%)" }} />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(0, 0%, 100%), transparent 70%)" }} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6 rounded-full px-5 py-2 text-sm font-bengali glass">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>সীমিত সময়ের অফার</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold font-bengali mb-5 leading-tight">
                আজই শুরু করুন আপনার<br className="hidden lg:block" /> সফলতার যাত্রা
              </h2>
              <p className="text-lg lg:text-xl font-bengali mb-10 max-w-2xl mx-auto opacity-85">
                হাজার হাজার উদ্যোক্তার মতো আপনিও পরিবর্তন আনুন। প্রথম পদক্ষেপটা এখনই নিন।
              </p>
              <Link to="/books">
                <Button size="lg" className="gap-2.5 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali text-lg shadow-gold px-10 py-7 rounded-xl">
                  এখনই বই কিনুন <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="mt-6 text-sm opacity-60 font-bengali">৭ দিনের মানি-ব্যাক গ্যারান্টি • তাৎক্ষণিক ডেলিভারি</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
