import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Facebook, Save, Loader2, Globe, Code, ImageIcon, Upload, X, CreditCard, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface SettingsMap {
  facebook_pixel_id: string;
  google_analytics_id: string;
  custom_head_code: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  facebook_url: string;
  youtube_url: string;
  instagram_url: string;
  site_logo_url: string;
}

const defaultSettings: SettingsMap = {
  facebook_pixel_id: "",
  google_analytics_id: "",
  custom_head_code: "",
  site_name: "Boi Bazar",
  site_description: "",
  contact_email: "",
  contact_phone: "",
  facebook_url: "",
  youtube_url: "",
  instagram_url: "",
  site_logo_url: "",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsMap>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({ paystation_merchant_id: "", paystation_password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAll = async () => {
      const [settingsRes, secureRes] = await Promise.all([
        supabase.from("site_settings").select("key, value"),
        supabase.from("secure_settings" as any).select("key, value"),
      ]);
      if (settingsRes.data) {
        const map = { ...defaultSettings };
        settingsRes.data.forEach((row: any) => {
          if (row.key in map) (map as any)[row.key] = row.value || "";
        });
        setSettings(map);
      }
      if (secureRes.data) {
        const pc = { paystation_merchant_id: "", paystation_password: "" };
        (secureRes.data as any[]).forEach((row: any) => {
          if (row.key === "paystation_merchant_id") pc.paystation_merchant_id = row.value || "";
          if (row.key === "paystation_password") pc.paystation_password = row.value || "";
        });
        setPaymentConfig(pc);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(settings);
      for (const [key, value] of entries) {
        await supabase
          .from("site_settings")
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      }
      toast({ title: "সেটিংস সেভ হয়েছে ✓" });
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "শুধুমাত্র ইমেজ ফাইল আপলোড করুন", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "ফাইল সাইজ ২MB এর বেশি হতে পারবে না", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `site-logo-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("book-covers")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("book-covers").getPublicUrl(fileName);
      setSettings({ ...settings, site_logo_url: urlData.publicUrl });
      toast({ title: "লোগো আপলোড হয়েছে ✓" });
    } catch (err: any) {
      toast({ title: "আপলোড ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeLogo = () => {
    setSettings({ ...settings, site_logo_url: "" });
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-bengali">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-bengali text-foreground">সাইট সেটিংস</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 font-bengali">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          সেভ করুন
        </Button>
      </div>

      {/* Logo */}
      <Card className="shadow-brand-sm">
        <CardHeader>
          <CardTitle className="font-bengali text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" /> সাইট লোগো
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Preview */}
            <div className="shrink-0">
              {settings.site_logo_url ? (
                <div className="relative group">
                  <div className="h-24 w-24 rounded-xl border border-border overflow-hidden bg-muted flex items-center justify-center">
                    <img src={settings.site_logo_url} alt="Site Logo" className="h-full w-full object-contain" />
                  </div>
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground font-bengali">
                সাইটের Navbar ও Footer-এ এই লোগো দেখানো হবে। PNG বা SVG ফরম্যাট সেরা। সর্বোচ্চ ২MB।
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2 font-bengali"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "আপলোড হচ্ছে..." : "লোগো আপলোড করুন"}
              </Button>
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs">অথবা লোগো URL দিন</Label>
                <Input
                  value={settings.site_logo_url}
                  onChange={(e) => setSettings({ ...settings, site_logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General */}
      <Card className="shadow-brand-sm">
        <CardHeader>
          <CardTitle className="font-bengali text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> সাধারণ তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-bengali">সাইটের নাম</Label>
            <Input value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">যোগাযোগ ইমেইল</Label>
            <Input type="email" value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} placeholder="info@boibazar.com" />
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">ফোন নম্বর</Label>
            <Input value={settings.contact_phone} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} placeholder="+880..." />
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">Facebook পেজ URL</Label>
            <Input value={settings.facebook_url} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} placeholder="https://facebook.com/..." />
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">YouTube চ্যানেল URL</Label>
            <Input value={settings.youtube_url} onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })} placeholder="https://youtube.com/..." />
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">Instagram URL</Label>
            <Input value={settings.instagram_url} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} placeholder="https://instagram.com/..." />
          </div>
          <div className="col-span-full space-y-2">
            <Label className="font-bengali">সাইটের বিবরণ (SEO)</Label>
            <Textarea value={settings.site_description} onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} rows={2} placeholder="সার্চ ইঞ্জিনে দেখানোর জন্য সংক্ষিপ্ত বিবরণ" />
          </div>
        </CardContent>
      </Card>

      {/* Tracking & Pixels */}
      <Card className="shadow-brand-sm">
        <CardHeader>
          <CardTitle className="font-bengali text-base flex items-center gap-2">
            <Facebook className="h-4 w-4 text-blue-600" /> ট্র্যাকিং ও পিক্সেল
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bengali">Facebook Pixel ID</Label>
            <Input value={settings.facebook_pixel_id} onChange={(e) => setSettings({ ...settings, facebook_pixel_id: e.target.value })} placeholder="যেমন: 123456789012345" />
            <p className="text-xs text-muted-foreground font-bengali">Facebook Events Manager থেকে আপনার Pixel ID কপি করে এখানে পেস্ট করুন।</p>
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">Google Analytics ID</Label>
            <Input value={settings.google_analytics_id} onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })} placeholder="যেমন: G-XXXXXXXXXX" />
            <p className="text-xs text-muted-foreground font-bengali">Google Analytics 4 Measurement ID এখানে দিন।</p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Code */}
      <Card className="shadow-brand-sm">
        <CardHeader>
          <CardTitle className="font-bengali text-base flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" /> কাস্টম কোড
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label className="font-bengali">হেড সেকশনে কাস্টম কোড (Advanced)</Label>
          <Textarea value={settings.custom_head_code} onChange={(e) => setSettings({ ...settings, custom_head_code: e.target.value })} rows={4} placeholder="<script>...</script> বা অন্য যেকোনো কোড" className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground font-bengali">এই কোড সাইটের &lt;head&gt; সেকশনে যোগ হবে। সতর্কতার সাথে ব্যবহার করুন।</p>
        </CardContent>
      </Card>

      {/* Payment Gateway */}
      <Card className="shadow-brand-sm border-secondary/30">
        <CardHeader>
          <CardTitle className="font-bengali text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-secondary" /> পেমেন্ট গেটওয়ে (PayStation)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary-subtle rounded-xl p-4 border border-secondary/20">
            <p className="text-sm font-bengali text-muted-foreground">
              PayStation এর Merchant ID ও Password এখানে সেট করুন। এটি পরিবর্তন করলে আপনার পেমেন্ট গেটওয়ে মার্চেন্ট পরিবর্তন হবে।
            </p>
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">Merchant ID</Label>
            <Input
              value={paymentConfig.paystation_merchant_id}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, paystation_merchant_id: e.target.value })}
              placeholder="আপনার PayStation Merchant ID"
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={paymentConfig.paystation_password}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, paystation_password: e.target.value })}
                placeholder="আপনার PayStation Password"
                className="font-body pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleSavePayment} disabled={savingPayment} className="gap-2 font-bengali bg-secondary hover:bg-secondary-light text-secondary-foreground shadow-gold">
            {savingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            পেমেন্ট সেটিংস সেভ করুন
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
