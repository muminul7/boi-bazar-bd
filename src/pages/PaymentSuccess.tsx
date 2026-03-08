import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      // Fetch order details (public access via anon key won't work since RLS restricts to admin)
      // Just show based on URL params
    }
  }, [orderId]);

  const isSuccess = status === "success";
  const isFailed = status === "failed";
  const isCancelled = status === "cancelled";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card rounded-2xl shadow-brand-lg border border-border w-full max-w-md p-8 text-center animate-slide-up">
        {isSuccess ? (
          <>
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-5 animate-scale-in">
              <CheckCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-bengali text-foreground mb-3">পেমেন্ট সফল হয়েছে! 🎉</h1>
            <p className="font-bengali text-muted-foreground mb-6">
              আপনার ইমেইলে ডাউনলোড লিংক পাঠানো হবে। ৪৮ ঘণ্টার মধ্যে ডাউনলোড করুন।
            </p>
            {orderId && (
              <div className="bg-primary-subtle rounded-xl p-4 mb-6 text-sm font-bengali text-left">
                <div><span className="font-semibold text-foreground">অর্ডার ID:</span> <span className="font-body text-xs">{orderId.slice(0, 8)}...</span></div>
              </div>
            )}
          </>
        ) : isCancelled ? (
          <>
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-bengali text-foreground mb-3">পেমেন্ট বাতিল হয়েছে</h1>
            <p className="font-bengali text-muted-foreground mb-6">
              আপনি পেমেন্ট বাতিল করেছেন। আবার চেষ্টা করুন।
            </p>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-destructive flex items-center justify-center mx-auto mb-5">
              <XCircle className="h-8 w-8 text-destructive-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-bengali text-foreground mb-3">পেমেন্ট ব্যর্থ হয়েছে</h1>
            <p className="font-bengali text-muted-foreground mb-6">
              পেমেন্ট প্রক্রিয়ায় সমস্যা হয়েছে। আবার চেষ্টা করুন বা অন্য পদ্ধতি ব্যবহার করুন।
            </p>
          </>
        )}

        <div className="flex flex-col gap-3">
          <Link to="/books">
            <Button className="w-full gap-2 font-bengali">
              বই স্টোরে ফিরে যান <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full font-bengali">
              হোম পেজে যান
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
