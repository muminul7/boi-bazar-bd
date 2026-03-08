import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Download, Mail, RefreshCw, ShieldCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("order_id");

  const isSuccess = status === "success";
  const isFailed = status === "failed";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {isSuccess ? <SuccessView orderId={orderId} /> : isFailed ? <FailedView /> : <CancelledView />}
    </div>
  );
}

function SuccessView({ orderId }: { orderId: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card rounded-3xl shadow-brand-xl border border-border w-full max-w-lg p-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="h-20 w-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="h-10 w-10 text-primary-foreground" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h1 className="text-3xl font-bold font-bengali text-foreground mb-2">পেমেন্ট সফল হয়েছে! 🎉</h1>
        <p className="font-bengali text-muted-foreground mb-6 text-lg">
          অভিনন্দন! আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে।
        </p>
      </motion.div>

      {orderId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-primary-subtle rounded-2xl p-5 mb-6 text-sm font-bengali text-left space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">অর্ডার ID</span>
            <span className="font-body font-semibold text-foreground text-xs">{orderId.slice(0, 8).toUpperCase()}...</span>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="space-y-3 mb-8"
      >
        {[
          { icon: Mail, text: "ডাউনলোড লিংক আপনার ইমেইলে পাঠানো হয়েছে" },
          { icon: Download, text: "৪৮ ঘণ্টার মধ্যে সর্বোচ্চ ৩ বার ডাউনলোড করতে পারবেন" },
          { icon: ShieldCheck, text: "৭ দিনের মানি-ব্যাক গ্যারান্টি প্রযোজ্য" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-left">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bengali text-muted-foreground">{item.text}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="flex flex-col gap-3"
      >
        <Link to="/books">
          <Button size="lg" className="w-full gap-2 font-bengali rounded-xl py-6 bg-secondary hover:bg-secondary-light text-secondary-foreground shadow-gold">
            আরও বই দেখুন <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="lg" className="w-full font-bengali rounded-xl py-6">
            হোম পেজে যান
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function FailedView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card rounded-3xl shadow-brand-xl border border-border w-full max-w-lg p-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="h-20 w-20 rounded-full bg-destructive flex items-center justify-center mx-auto mb-6"
      >
        <XCircle className="h-10 w-10 text-destructive-foreground" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h1 className="text-3xl font-bold font-bengali text-foreground mb-2">পেমেন্ট ব্যর্থ হয়েছে 😔</h1>
        <p className="font-bengali text-muted-foreground mb-6 text-lg">
          দুঃখিত, পেমেন্ট প্রক্রিয়ায় সমস্যা হয়েছে। চিন্তার কিছু নেই — আপনার টাকা কাটা হয়নি।
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-destructive/5 rounded-2xl p-5 mb-6 text-left"
      >
        <h3 className="font-bengali font-semibold text-foreground text-sm mb-3">সম্ভাব্য কারণ:</h3>
        <ul className="space-y-2 text-sm font-bengali text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-destructive mt-0.5">•</span>
            ইন্টারনেট সংযোগে বিঘ্ন ঘটেছে
          </li>
          <li className="flex items-start gap-2">
            <span className="text-destructive mt-0.5">•</span>
            পেমেন্ট মেথডে পর্যাপ্ত ব্যালেন্স নেই
          </li>
          <li className="flex items-start gap-2">
            <span className="text-destructive mt-0.5">•</span>
            ব্যাংক বা মোবাইল ব্যাংকিং সার্ভারে সমস্যা
          </li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="space-y-3 mb-8"
      >
        {[
          { icon: RefreshCw, text: "আবার চেষ্টা করুন অথবা অন্য পেমেন্ট মেথড ব্যবহার করুন" },
          { icon: Phone, text: "সমস্যা থাকলে আমাদের সাপোর্টে যোগাযোগ করুন" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-left">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <item.icon className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm font-bengali text-muted-foreground">{item.text}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="flex flex-col gap-3"
      >
        <Link to="/books">
          <Button size="lg" className="w-full gap-2 font-bengali rounded-xl py-6">
            <RefreshCw className="h-5 w-5" /> আবার চেষ্টা করুন
          </Button>
        </Link>
        <Link to="/contact">
          <Button variant="outline" size="lg" className="w-full gap-2 font-bengali rounded-xl py-6">
            <Phone className="h-5 w-5" /> সাপোর্টে যোগাযোগ
          </Button>
        </Link>
        <Link to="/">
          <Button variant="ghost" className="w-full font-bengali">
            হোম পেজে যান
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function CancelledView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card rounded-3xl shadow-brand-xl border border-border w-full max-w-lg p-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6"
      >
        <AlertTriangle className="h-10 w-10 text-secondary-foreground" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h1 className="text-3xl font-bold font-bengali text-foreground mb-2">পেমেন্ট বাতিল হয়েছে</h1>
        <p className="font-bengali text-muted-foreground mb-8 text-lg">
          আপনি পেমেন্ট বাতিল করেছেন। আপনার টাকা কাটা হয়নি। যেকোনো সময় আবার চেষ্টা করতে পারবেন।
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex flex-col gap-3"
      >
        <Link to="/books">
          <Button size="lg" className="w-full gap-2 font-bengali rounded-xl py-6 bg-secondary hover:bg-secondary-light text-secondary-foreground shadow-gold">
            বই স্টোরে ফিরুন <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="lg" className="w-full font-bengali rounded-xl py-6">
            হোম পেজে যান
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
