export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-12">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl lg:text-4xl font-bold font-bengali text-primary-foreground">গোপনীয়তা নীতি</h1>
        </div>
      </div>
      <div className="container mx-auto py-12 max-w-3xl">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-brand-sm space-y-6 font-bengali text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3">তথ্য সংগ্রহ</h2>
            <p className="text-muted-foreground">আমরা আপনার নাম, ইমেইল, ফোন নম্বর এবং পেমেন্ট সংক্রান্ত তথ্য সংগ্রহ করি শুধুমাত্র অর্ডার প্রক্রিয়াকরণ ও ই-বুক ডেলিভারির জন্য। আমরা আপনার তথ্য কোনো তৃতীয় পক্ষের সাথে বিক্রি বা শেয়ার করি না।</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-3">তথ্যের ব্যবহার</h2>
            <p className="text-muted-foreground">আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হয়:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>অর্ডার প্রক্রিয়াকরণ ও ই-বুক ডেলিভারি</li>
              <li>কাস্টমার সাপোর্ট প্রদান</li>
              <li>নতুন বই ও অফার সম্পর্কে জানানো (আপনার অনুমতিতে)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-3">তথ্য সুরক্ষা</h2>
            <p className="text-muted-foreground">আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি। আপনার পেমেন্ট তথ্য সরাসরি আমাদের সার্ভারে সংরক্ষণ করা হয় না — এটি নিরাপদ পেমেন্ট গেটওয়ে দ্বারা প্রক্রিয়া করা হয়।</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-3">কুকিজ</h2>
            <p className="text-muted-foreground">আমাদের ওয়েবসাইট আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে কুকিজ ব্যবহার করতে পারে। আপনি আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন।</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-3">যোগাযোগ</h2>
            <p className="text-muted-foreground">গোপনীয়তা সংক্রান্ত কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।</p>
          </section>
        </div>
      </div>
    </div>
  );
}