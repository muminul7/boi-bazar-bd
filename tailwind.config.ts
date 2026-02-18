import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          glow: "hsl(var(--primary-glow))",
          subtle: "hsl(var(--primary-subtle))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: "hsl(var(--secondary-light))",
          subtle: "hsl(var(--secondary-subtle))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Brand custom
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
        },
        cream: "hsl(var(--cream))",
        dark: "hsl(var(--dark))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          raised: "hsl(var(--surface-raised))",
        },
        hero: {
          bg: "hsl(var(--hero-bg))",
          text: "hsl(var(--hero-text))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        bengali: ["Hind Siliguri", "Noto Serif Bengali", "sans-serif"],
        body: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(39 88% 52% / 0.4)" },
          "50%": { boxShadow: "0 0 0 10px hsl(39 88% 52% / 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, hsl(174, 65%, 22%) 0%, hsl(194, 65%, 20%) 100%)",
        "gradient-gold": "linear-gradient(135deg, hsl(39, 88%, 48%) 0%, hsl(32, 90%, 55%) 100%)",
        "gradient-card": "linear-gradient(180deg, hsl(0, 0%, 100%) 0%, hsl(174, 30%, 97%) 100%)",
        "gradient-section": "linear-gradient(180deg, hsl(174, 40%, 97%) 0%, hsl(42, 33%, 97%) 100%)",
      },
      boxShadow: {
        "brand-sm": "0 1px 3px hsl(174 30% 20% / 0.08), 0 1px 2px hsl(174 30% 20% / 0.06)",
        "brand-md": "0 4px 12px hsl(174 30% 20% / 0.1), 0 2px 4px hsl(174 30% 20% / 0.06)",
        "brand-lg": "0 10px 30px hsl(174 30% 20% / 0.12), 0 4px 10px hsl(174 30% 20% / 0.08)",
        "brand-xl": "0 20px 50px hsl(174 30% 20% / 0.15), 0 8px 20px hsl(174 30% 20% / 0.1)",
        "gold": "0 8px 25px hsl(39 88% 52% / 0.3)",
        "teal": "0 8px 25px hsl(174 65% 26% / 0.3)",
        "book": "0 15px 40px hsl(174 30% 20% / 0.18), 0 5px 15px hsl(174 30% 20% / 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
