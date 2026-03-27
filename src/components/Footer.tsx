import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen, Mail, Phone, Facebook, Youtube, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("site_settings").select("key, value")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach((row: any) => { if (row.value) map[row.key] = row.value; });
        setSettings(map);
      });
  }, []);

  const logoUrl = settings.site_logo_url;
  const contactEmail = settings.contact_email || "info@eboi.shop";
  const contactPhone = settings.contact_phone || "+8801601212570";

  const socialLinks = [
    { Icon: Facebook, url: settings.facebook_url },
    { Icon: Youtube, url: settings.youtube_url },
    { Icon: Instagram, url: settings.instagram_url },
  ].filter(s => s.url);

  return (
    <footer style={{ backgroundColor: "hsl(210, 25%, 12%)", color: "hsl(0, 0%, 100%)" }}>
      <div className="container mx-auto pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Boi Bazar" className="h-9 w-9 rounded-xl object-contain" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div>
                <div className="text-lg font-bold font-bengali">Boi Bazar</div>
                <div className="text-[10px] text-muted-foreground font-body tracking-wider uppercase">Book Store</div>
              </div>
            </Link>
            <p className="text-sm font-bengali leading-relaxed max-w-xs mb-5" style={{ color: "hsl(210, 20%, 70%)" }}>
              বাংলাদেশের ই-কমার্স উদ্যোক্তাদের জন্য প্রিমিয়াম বাংলা ই-বুক। আপনার ব্যবসাকে পরবর্তী স্তরে নিয়ে যান।
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map(({ Icon, url }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-primary transition-colors"
                    style={{ backgroundColor: "hsl(0, 0%, 100%, 0.1)" }}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bengali font-semibold mb-4 text-gold">দ্রুত লিংক</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "হোম" },
                { to: "/books", label: "বই স্টোর" },
                { to: "/contact", label: "যোগাযোগ" },
                { to: "/refund", label: "রিফান্ড নীতি" },
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
                <span className="font-body">{contactEmail}</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm" style={{ color: "hsl(210, 20%, 65%)" }}>
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span className="font-bengali">{contactPhone}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: "hsl(0, 0%, 100%, 0.1)", color: "hsl(210, 15%, 50%)" }}>
          <p className="font-bengali">© ২০২৫ Boi Bazar। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-4 font-bengali">
            <Link to="/privacy" className="hover:text-gold transition-colors">গোপনীয়তা নীতি</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">শর্তাবলী</Link>
            <Link to="/refund" className="hover:text-gold transition-colors">রিফান্ড নীতি</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}