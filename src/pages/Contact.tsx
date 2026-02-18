import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "বার্তা পাঠানো হয়েছে!", description: "আমরা শীঘ্রই যোগাযোগ করব।" });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-12">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl lg:text-4xl font-bold font-bengali text-primary-foreground mb-3">যোগাযোগ করুন</h1>
          <p className="text-primary-foreground/80 font-bengali max-w-lg mx-auto">
            কোনো প্রশ্ন বা সমস্যা থাকলে আমরা সাহায্য করতে সদা প্রস্তুত।
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: Mail, title: "ইমেইল", value: "support@ekitab.com.bd" },
              { icon: Phone, title: "ফোন", value: "+৮৮০ ১৭০০-০০০০০০" },
              { icon: MapPin, title: "ঠিকানা", value: "ঢাকা, বাংলাদেশ" },
              { icon: MessageCircle, title: "সাপোর্ট সময়", value: "সকাল ৯টা – রাত ৯টা" },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-brand-sm flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary-subtle flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bengali mb-0.5">{item.title}</p>
                  <p className="font-semibold text-foreground font-bengali">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-brand-md">
              <h2 className="font-bengali font-bold text-foreground text-xl mb-5">বার্তা পাঠান</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bengali text-sm mb-1.5 block">আপনার নাম *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="মো. রাহিম" className="font-bengali" required />
                  </div>
                  <div>
                    <Label className="font-bengali text-sm mb-1.5 block">ফোন</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="font-body" />
                  </div>
                </div>
                <div>
                  <Label className="font-bengali text-sm mb-1.5 block">ইমেইল *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@gmail.com" className="font-body" required />
                </div>
                <div>
                  <Label className="font-bengali text-sm mb-1.5 block">বার্তা *</Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="আপনার বার্তা লিখুন..." rows={5} className="font-bengali" required />
                </div>
                <Button type="submit" className="w-full gap-2 bg-primary hover:bg-primary-light text-primary-foreground font-bengali shadow-teal py-5">
                  <Send className="h-4 w-4" /> বার্তা পাঠান
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
