import { Shield, CheckCircle, Clock, Mail } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-12">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl lg:text-4xl font-bold font-bengali text-primary-foreground">রিফান্ড নীতি</h1>
        </div>
      </div>
      <div className="container mx-auto py-12 max-w-3xl">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-brand-sm space-y-6 font-bengali text-foreground leading-relaxed">
          {/* Guarantee Banner */}
          <div className="bg-gradient-hero rounded-2xl p-6 text-primary-foreground flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-gold">
              <Shield className="h-7 w-7 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg mb-1">৭ দিনের মানি-ব্যাক গ্যারান্টি</h2>
              <p className="text-sm opacity-90">আমরা আমাদের পণ্যের মানের ব্যাপারে আত্মবিশ্বাসী। তাই আপনাকে ৭ দিনের সম্পূর্ণ রিফান্ড গ্যারান্টি দিচ্ছি।</p>
            </div>
          </div>

          <section>
            <h2 className="text-xl font-bold mb-3">রিফান্ড যোগ্যতা</h2>
            <div className="space-y-3">
              {[
                "ক্রয়ের তারিখ থেকে ৭ দিনের মধ্যে রিফান্ড অনুরোধ করতে হবে",
                "রিফান্ডের কারণ উল্লেখ করতে হবে",
                "প্রতিটি গ্রাহক প্রতিটি বইয়ের জন্য একবার রিফান্ড পাবেন",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">রিফান্ড প্রক্রিয়া</h2>
            <div className="space-y-3">
              {[
                { icon: Mail, text: "আমাদের সাপোর্ট ইমেইলে রিফান্ড অনুরোধ পাঠান" },
                { icon: Clock, text: "আমরা ৪৮ ঘণ্টার মধ্যে আপনার অনুরোধ পর্যালোচনা করব" },
                { icon: Shield, text: "অনুমোদিত হলে ৩-৫ কর্মদিবসের মধ্যে আপনার পেমেন্ট মেথডে টাকা ফেরত দেওয়া হবে" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-muted rounded-xl p-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">যেসব ক্ষেত্রে রিফান্ড প্রযোজ্য নয়</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>৭ দিনের পর রিফান্ড অনুরোধ</li>
              <li>বইটি সম্পূর্ণ ডাউনলোড ও পড়ার পর বারবার রিফান্ড অনুরোধ</li>
              <li>কুপন বা বিশেষ ছাড়ে কেনা বইয়ের ক্ষেত্রে শুধুমাত্র প্রকৃত পরিশোধিত অর্থ ফেরত দেওয়া হবে</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}