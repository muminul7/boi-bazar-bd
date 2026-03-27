import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, BookOpen, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { href: "/", label: "হোম" },
  { href: "/books", label: "বই স্টোর" },
  { href: "/contact", label: "যোগাযোগ" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_logo_url")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setLogoUrl(data.value);
      });
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-md shadow-brand-sm">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            <img src={logoUrl} alt="eBoi" className="h-9 w-9 rounded-xl object-contain" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary group-hover:bg-primary-light transition-colors">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold text-foreground font-bengali tracking-tight">eBoi</span>
            <span className="text-[10px] text-muted-foreground font-body tracking-wider uppercase">Book Store</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium font-bengali transition-all duration-200 ${
                location.pathname === link.href
                  ? "text-primary bg-primary-subtle"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/books">
            <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary-light font-bengali shadow-teal">
              <ShoppingBag className="h-4 w-4" />
              বই কিনুন
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="মেনু"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slide-up">
          <div className="container mx-auto py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium font-bengali transition-colors ${
                  location.pathname === link.href
                    ? "text-primary bg-primary-subtle"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              <Link to="/books" onClick={() => setIsOpen(false)}>
                <Button className="w-full gap-2 bg-primary hover:bg-primary-light font-bengali">
                  <ShoppingBag className="h-4 w-4" />
                  বই কিনুন
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
