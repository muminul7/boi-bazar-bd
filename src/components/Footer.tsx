import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin, Facebook, Youtube, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "hsl(210, 25%, 12%)", color: "hsl(0, 0%, 100%)" }}>
      <div className="container mx-auto pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-lg font-bold font-bengali">একিতাব</div>
                <div className="text-[10px] text-muted-foreground font-body tracking-wider uppercase">eKitab Store</div>
              </div>
            </Link>
            <p className="text-sm font-bengali leading-relaxed max-w-xs mb-5" style={{ color: "hsl(210, 20%, 70%)" }}>
              বাংলাদেশের ই-কমার্স উদ্যোক্তাদের জন্য প্রিমিয়াম বাংলা ই-বুক। আপনার ব্যবসাকে পরবর্তী স্তরে নিয়ে যান।
            </p>
            <div className="flex gap-3">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-primary transition-colors"
                  style={{ backgroundColor: "hsl(0, 0%, 100%, 0.1)" }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bengali font-semibold mb-4 text-gold">দ্রুত লিংক</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "হোম" },
                { to: "/books", label: "বই স্টোর" },
                { to: "/contact", label: "যোগাযোগ" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-bengali hover:text-gold transition-colors"
                    style={{ color: "hsl(210, 20%, 65%)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bengali font-semibold mb-4 text-gold">যোগাযোগ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm" style={{ color: "hsl(210, 20%, 65%)" }}>
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span className="font-body">support@ekitab.com.bd</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm" style={{ color: "hsl(210, 20%, 65%)" }}>
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span className="font-bengali">+৮৮০ ১৭০০-০০০০০০</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm" style={{ color: "hsl(210, 20%, 65%)" }}>
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span className="font-bengali">ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: "hsl(0, 0%, 100%, 0.1)", color: "hsl(210, 15%, 50%)" }}>
          <p className="font-bengali">© ২০২৫ একিতাব। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-4 font-bengali">
            {["গোপনীয়তা নীতি", "শর্তাবলী", "রিফান্ড নীতি"].map((t) => (
              <a key={t} href="#" className="hover:text-gold transition-colors">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
