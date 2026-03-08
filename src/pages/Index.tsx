import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle, Star, Shield, Zap, TrendingUp, Users, Sparkles, Download, Heart, Quote, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooks } from "@/hooks/useBooks";
import BookCard from "@/components/BookCard";
import heroIllustration from "@/assets/hero-illustration.jpg";
import { motion, type Variants } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } })
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const stats = [
{ value: "৫,০০০+", label: "উদ্যোক্তা", icon: Users },
{ value: "১৫+", label: "প্র্যাকটিক্যাল গাইড", icon: BookOpen },
{ value: "৯৮%", label: "পাঠক সন্তুষ্ট", icon: TrendingUp },
{ value: "৭ দিন", label: "মানি-ব্যাক গ্যারান্টি", icon: Shield }];


const benefits = [
{ icon: BookOpen, title: "বিশেষজ্ঞের অভিজ্ঞতা", desc: "বাস্তব সফল উদ্যোক্তাদের কাছ থেকে শেখা জ্ঞান, শুধু থিওরি নয়।", color: "bg-primary/10 text-primary" },
{ icon: Zap, title: "তাৎক্ষণিক ডেলিভারি", desc: "পেমেন্ট করার সাথে সাথেই ইমেইলে PDF পাবেন। দেরি নেই।", color: "bg-secondary/10 text-secondary" },
{ icon: TrendingUp, title: "প্রমাণিত কৌশল", desc: "বাংলাদেশের বাজারে পরীক্ষিত এবং কার্যকর ব্যবসায়িক কৌশল।", color: "bg-primary/10 text-primary" },
{ icon: Shield, title: "৭ দিনের গ্যারান্টি", desc: "সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত। কোনো প্রশ্ন নেই।", color: "bg-destructive/10 text-destructive" },
{ icon: Users, title: "কমিউনিটি সাপোর্ট", desc: "প্রাইভেট Facebook গ্রুপে বিশেষজ্ঞদের সাথে যোগাযোগ করুন।", color: "bg-secondary/10 text-secondary" },
{ icon: Download, title: "আপডেট বিনামূল্যে", desc: "একবার কিনলেই পরবর্তী সব আপডেট বিনামূল্যে পাবেন।", color: "bg-primary/10 text-primary" }];


const steps = [
{ num: "১", title: "বই বেছে নিন", desc: "আপনার প্রয়োজন অনুযায়ী সেরা গাইড বাছাই করুন" },
{ num: "২", title: "পেমেন্ট করুন", desc: "বিকাশ, নগদ, কার্ড — যেকোনো পদ্ধতিতে পে করুন" },
{ num: "৩", title: "ডাউনলোড করুন", desc: "ইমেইলে তাৎক্ষণিক ডাউনলোড লিংক পান" },
{ num: "৪", title: "সফল হন", desc: "প্রমাণিত কৌশল প্রয়োগ করে আয় শুরু করুন" }];


export default function HomePage() {
  const { data: books = [] } = useBooks();
  const featuredBooks = useMemo(() => books.filter((b) => b.featured), [books]);
  const bestSellers = useMemo(() => books.filter((b) => b.bestSeller), [books]);
  const categories = useMemo(() => {
    const cats = new Set(books.map((b) => b.category).filter(Boolean));
    return ["সব বই", ...Array.from(cats)];
  }, [books]);

  // Fetch testimonials from DB
  const [testimonials, setTestimonials] = useState<{name: string;role: string;rating: number;text: string;avatar: string;}[]>([]);
  useEffect(() => {
    supabase.
    from("testimonials").
    select("*").
    eq("active", true).
    order("sort_order", { ascending: true }).
    limit(6).
    then(({ data }) => {
      setTestimonials(
        (data || []).map((t: any) => ({
          name: t.name,
          role: t.role || "",
          rating: t.rating,
          text: t.text,
          avatar: t.avatar || t.name?.charAt(0) || "?"
        }))
      );
    });
  }, []);

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "ইতোমধ্যে সাবস্ক্রাইব করা হয়েছে!", description: "এই ইমেইল আগে থেকেই আমাদের তালিকায় আছে।" });
        } else throw error;
      } else {
        toast({ title: "সাবস্ক্রিপশন সফল! 🎉", description: "নতুন বই ও অফারের আপডেট পাবেন ইমেইলে।" });
        setEmail("");
      }
    } catch {
      toast({ title: "কিছু সমস্যা হয়েছে", description: "অনুগ্রহ করে আবার চেষ্টা করুন।", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "repeating-linear-gradient(45deg, hsl(0,0%,100%) 0, hsl(0,0%,100%) 1px, transparent 1px, transparent 30px)" }} />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, hsl(0,0%,100%) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full opacity-[0.1]" style={{ background: "radial-gradient(circle, hsl(39, 88%, 52%), transparent 60%)" }} />
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, hsl(174, 65%, 60%), transparent 60%)" }} />
          <div className="absolute top-0 right-1/3 h-[400px] w-[400px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(39, 70%, 70%), transparent 60%)" }} />
        </div>

        <div className="container mx-auto py-20 lg:py-28 relative z-10">
          <div className="flex flex-col items-center text-primary-foreground max-w-3xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 mb-8 rounded-full px-5 py-2.5 text-sm font-bengali glass">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>জ্ঞান যখন আপনার সবচেয়ে বড় সম্পদ</span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-bold font-bengali mb-8">
                <span className="block md:text-4xl lg:text-4xl xl:text-5xl leading-tight opacity-90 mb-4 text-2xl font-semibold py-0">যে শেখা বন্ধ করে, সে পিছিয়ে পড়ে।</span>
                <span className="relative inline-block">
                  <span className="block text-4xl md:text-5xl lg:text-5xl xl:text-6xl text-gradient-gold leading-tight font-bold">যে শেখা চালিয়ে যায়,</span>
                </span>
                <span className="relative inline-block mt-1">
                  <span className="block text-4xl md:text-5xl lg:text-5xl xl:text-6xl text-gradient-gold leading-tight font-bold">সে এগিয়ে যায়।</span>
                  <motion.svg initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }} className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 10" fill="none">
                    <motion.path d="M2 7C50 3 100 2 150 4C200 6 250 5 298 3" stroke="hsl(39, 88%, 52%)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }} />
                  </motion.svg>
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="text-lg lg:text-xl font-bengali leading-relaxed mb-10 opacity-80 max-w-2xl mx-auto">
                মার্কেটিং, বিজনেস অটোমেশন, AI, স্কেলিং — সব ধরনের উদ্যোক্তাদের জন্য তৈরি প্র্যাকটিক্যাল গাইড।
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                <Link to="/books">
                  <Button size="lg" className="gap-2.5 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali text-base shadow-gold px-10 py-6 rounded-xl">
                    <span className="font-bold">বই দেখুন</span> <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap justify-center gap-6 lg:gap-10">
                {stats.slice(0, 3).map((s, i) =>
                <div key={s.label} className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl glass flex items-center justify-center">
                      <s.icon className="h-5 w-5 text-gold" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold font-body text-gold">{s.value}</div>
                      <div className="text-xs font-bengali opacity-70">{s.label}</div>
                    </div>
                    {i < 2 && <div className="hidden lg:block h-8 w-px bg-white/15 ml-4" />}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative -mt-1 bg-card border-y border-border">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) =>
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold font-body text-foreground">{s.value}</div>
                <div className="text-sm font-bengali text-muted-foreground">{s.label}</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ─── FEATURED BOOKS ─── */}
      {featuredBooks.length > 0 &&
      <section className="section-py bg-background">
          <div className="container mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary font-bengali mb-2 tracking-wide uppercase">বিশেষ সংগ্রহ</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-4">ফিচার্ড বই সমূহ</motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground font-bengali max-w-xl mx-auto text-lg">আমাদের পাঠকদের সবচেয়ে প্রিয় এবং সর্বাধিক বিক্রিত বইগুলো</motion.p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.slice(0, 6).map((cat) =>
            <Link key={cat} to={cat === "সব বই" ? "/books" : `/books?category=${encodeURIComponent(cat)}`} className="badge-pill bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border border-border hover:border-primary hover:shadow-teal">
                  {cat}
                </Link>
            )}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {featuredBooks.map((book, i) =>
            <motion.div key={book.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <BookCard book={book} />
                </motion.div>
            )}
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
      }

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="section-py bg-card border-y border-border">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-secondary font-bengali mb-2">সহজ ৪ ধাপ</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-foreground">কিভাবে কাজ করে?</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center group">
                <div className="relative inline-flex mb-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold font-body shadow-teal group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                </div>
                {i < steps.length - 1 && <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />}
                <h3 className="font-bengali font-bold text-foreground text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground font-bengali text-sm">{step.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section id="benefits" className="section-py bg-background">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary font-bengali mb-2">কেন Boi Bazar?</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-4">আমাদের সুবিধাসমূহ</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="bg-card rounded-2xl p-7 border border-border shadow-brand-sm hover:shadow-brand-lg transition-all duration-300 hover-lift group">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-5 ${b.color} transition-transform group-hover:scale-110`}>
                  <b.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bengali font-bold text-foreground text-lg mb-2">{b.title}</h3>
                <p className="text-muted-foreground font-bengali text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ─── BESTSELLERS ─── */}
      {bestSellers.length > 0 &&
      <section className="section-py bg-card border-y border-border">
          <div className="container mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
              <motion.p variants={fadeUp} className="text-sm font-semibold text-gold font-bengali mb-2">🏆 পাঠকদের পছন্দ</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold font-bengali text-foreground">বেস্টসেলার বই</motion.h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              {bestSellers.map((book, i) =>
            <motion.div key={book.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <BookCard book={book} />
                </motion.div>
            )}
            </div>
          </div>
        </section>
      }

      {/* ─── TESTIMONIALS ─── */}
      {testimonials.length > 0 &&
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
              {testimonials.map((t, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="bg-card rounded-2xl p-7 shadow-brand-xl relative group hover-lift">
                  <Quote className="absolute top-5 right-5 h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, j) =>
                <Star key={j} className="h-4 w-4 text-gold fill-current" />
                )}
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
            )}
            </div>
          </div>
        </section>
      }

      {/* ─── SOCIAL PROOF BANNER ─── */}
      <section className="bg-secondary py-6">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <Heart className="h-6 w-6 text-secondary-foreground animate-pulse" />
            <p className="font-bengali font-semibold text-secondary-foreground text-lg">
              <span className="font-body">৫,০০০+</span> উদ্যোক্তা ইতোমধ্যে তাদের ব্যবসা বদলে ফেলেছেন Boi Bazar-এর সাথে
            </p>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="section-py bg-card border-y border-border">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold font-bengali text-foreground mb-4">নতুন বইয়ের আপডেট পান</h2>
            <p className="text-muted-foreground font-bengali text-lg mb-8">নতুন বই প্রকাশ, এক্সক্লুসিভ ডিসকাউন্ট এবং ফ্রি রিসোর্স সরাসরি আপনার ইমেইলে।</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="আপনার ইমেইল লিখুন" className="flex-1 h-12 px-5 rounded-xl border border-border bg-background text-foreground font-bengali placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <Button type="submit" disabled={subscribing} size="lg" className="gap-2 bg-primary hover:bg-primary-light text-primary-foreground font-bengali rounded-xl px-8 h-12 shadow-teal">
                {subscribing ? "সাবমিট হচ্ছে..." : <>সাবস্ক্রাইব <Send className="h-4 w-4" /></>}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground font-bengali mt-4">স্প্যাম করা হবে না। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।</p>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="section-py bg-background">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-gradient-hero rounded-3xl p-10 lg:p-20 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, hsl(39, 88%, 52%), transparent 70%)" }} />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(0, 0%, 100%), transparent 70%)" }} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6 rounded-full px-5 py-2 text-sm font-bengali glass">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>সীমিত সময়ের অফার</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold font-bengali mb-5 leading-tight">আজই শুরু করুন আপনার<br className="hidden lg:block" /> সফলতার যাত্রা</h2>
              <p className="text-lg lg:text-xl font-bengali mb-10 max-w-2xl mx-auto opacity-85">হাজার হাজার উদ্যোক্তার মতো আপনিও পরিবর্তন আনুন। প্রথম পদক্ষেপটা এখনই নিন।</p>
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
    </div>);

}