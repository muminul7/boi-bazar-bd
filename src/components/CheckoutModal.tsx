import { useState } from "react";
import { X, ShoppingCart, CreditCard, Smartphone, Shield, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Book } from "@/data/books";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  book: Book;
}

type PaymentMethod = "paystation";

const paymentMethods: { id: PaymentMethod; label: string; desc: string; emoji: string }[] = [
  { id: "paystation", label: "PayStation", desc: "কার্ড, বিকাশ, নগদ, রকেট সব সাপোর্ট", emoji: "💳" },
];

export default function CheckoutModal({ open, onClose, book }: CheckoutModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "payment">("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("sslcommerz");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  if (!open) return null;

  const discount = couponDiscount;
  const total = Math.max(book.price - discount, 0);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;

    // Try to validate coupon from DB
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", coupon.toUpperCase())
      .maybeSingle();

    if (error || !data) {
      toast({ title: "কুপন কোড ভুল", description: "সঠিক কুপন কোড দিন।", variant: "destructive" });
      return;
    }

    const discountAmount = data.discount_type === "percentage"
      ? Math.round(book.price * data.discount_value / 100)
      : data.discount_value;

    setCouponDiscount(discountAmount);
    setCouponApplied(true);
    toast({ title: "কুপন প্রয়োগ হয়েছে!", description: `৳${discountAmount} ছাড় পেয়েছেন।` });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast({ title: "তথ্য পূরণ করুন", description: "নাম, ইমেইল ও ফোন নম্বর আবশ্যক।", variant: "destructive" });
      return;
    }
    setStep("payment");
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("initiate-payment", {
        body: {
          bookId: book.id,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          billingAddress: form.address,
          couponCode: couponApplied ? coupon.toUpperCase() : null,
          amount: total,
          discount,
        },
      });

      if (error) throw error;

      if (data?.gatewayUrl) {
        // Redirect to SSLCommerz payment page
        window.location.href = data.gatewayUrl;
      } else {
        throw new Error(data?.error || "Payment gateway error");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast({ title: "পেমেন্ট ত্রুটি", description: err.message || "পেমেন্ট শুরু করতে সমস্যা হয়েছে।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card rounded-2xl shadow-brand-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-bengali font-bold text-foreground text-lg">চেকআউট</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Book Summary */}
        <div className="p-5 border-b border-border flex gap-3">
          <img src={book.cover} alt={book.title} className="h-16 w-12 object-cover rounded-lg shadow-brand-sm" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bengali font-semibold text-foreground text-sm line-clamp-2">{book.title}</h3>
            <p className="font-bengali text-xs text-muted-foreground">{book.author}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-bold font-body text-primary">৳{total}</span>
              {couponApplied && <span className="text-xs text-destructive line-through font-body">৳{book.price}</span>}
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* ── Step 1: Form ── */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label className="font-bengali text-sm mb-1.5 block">আপনার নাম *</Label>
                <Input placeholder="মো. রাহিম উদ্দিন" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="font-bengali" />
              </div>
              <div>
                <Label className="font-bengali text-sm mb-1.5 block">ইমেইল ঠিকানা *</Label>
                <Input type="email" placeholder="example@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-body" />
              </div>
              <div>
                <Label className="font-bengali text-sm mb-1.5 block">মোবাইল নম্বর *</Label>
                <Input type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-body" />
              </div>
              <div>
                <Label className="font-bengali text-sm mb-1.5 block">ঠিকানা (ঐচ্ছিক)</Label>
                <Input placeholder="বিলিং ঠিকানা" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="font-bengali" />
              </div>

              {/* Coupon */}
              <div>
                <Label className="font-bengali text-sm mb-1.5 block">কুপন কোড</Label>
                <div className="flex gap-2">
                  <Input placeholder="EKITAB10" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="font-body" disabled={couponApplied} />
                  <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={couponApplied || !coupon} className="font-bengali border-primary text-primary hover:bg-primary-subtle shrink-0">
                    {couponApplied ? "✓" : "প্রয়োগ"}
                  </Button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-muted rounded-xl p-4 space-y-2 text-sm font-bengali">
                <div className="flex justify-between text-muted-foreground">
                  <span>বইয়ের মূল্য</span>
                  <span className="font-body">৳{book.price}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-primary">
                    <span>কুপন ছাড়</span>
                    <span className="font-body">-৳{discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground border-t border-border pt-2">
                  <span>মোট</span>
                  <span className="font-body text-primary">৳{total}</span>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2 bg-secondary hover:bg-secondary-light text-secondary-foreground font-bengali py-6 shadow-gold">
                পেমেন্ট করুন <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* ── Step 2: Payment Method ── */}
          {step === "payment" && (
            <div className="space-y-4">
              <p className="font-bengali text-sm text-muted-foreground">পেমেন্ট পদ্ধতি বেছে নিন:</p>
              <div className="space-y-2.5">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      paymentMethod === pm.id
                        ? "border-primary bg-primary-subtle shadow-teal"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{pm.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bengali font-semibold text-foreground text-sm">{pm.label}</div>
                      <div className="font-bengali text-xs text-muted-foreground">{pm.desc}</div>
                    </div>
                    {paymentMethod === pm.id && (
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary-subtle border border-secondary/30 text-xs font-bengali text-secondary-foreground">
                <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                <span>আপনার পেমেন্ট SSLCommerz দ্বারা সুরক্ষিত। বিকাশ ও নগদ পেমেন্ট SSLCommerz গেটওয়ে দিয়ে প্রসেস হবে।</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 font-bengali" onClick={() => setStep("form")} disabled={loading}>
                  পেছনে
                </Button>
                <Button
                  className="flex-1 gap-2 bg-primary hover:bg-primary-light text-primary-foreground font-bengali shadow-teal"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> প্রসেসিং...</>
                  ) : (
                    <><CreditCard className="h-4 w-4" /> পে করুন ৳{total}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
