import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Facebook, Save, Loader2, Globe, Code } from "lucide-react";
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
}

const defaultSettings: SettingsMap = {
  facebook_pixel_id: "",
  google_analytics_id: "",
  custom_head_code: "",
  site_name: "একিতাব",
  site_description: "",
  contact_email: "",
  contact_phone: "",
  facebook_url: "",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsMap>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const map = { ...defaultSettings };
        data.forEach((row: any) => {
          if (row.key in map) {
            (map as any)[row.key] = row.value || "";
          }
        });
        setSettings(map);
      }
      setLoading(false);
    };
    fetchSettings();
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
            <Input type="email" value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} placeholder="info@ekitab.com" />
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">ফোন নম্বর</Label>
            <Input value={settings.contact_phone} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} placeholder="+880..." />
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">Facebook পেজ URL</Label>
            <Input value={settings.facebook_url} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} placeholder="https://facebook.com/..." />
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
            <Input
              value={settings.facebook_pixel_id}
              onChange={(e) => setSettings({ ...settings, facebook_pixel_id: e.target.value })}
              placeholder="যেমন: 123456789012345"
            />
            <p className="text-xs text-muted-foreground font-bengali">
              Facebook Events Manager থেকে আপনার Pixel ID কপি করে এখানে পেস্ট করুন।
              এটি সেভ করলে সাইটের সব পেজে Facebook Pixel স্বয়ংক্রিয়ভাবে যোগ হবে।
            </p>
          </div>
          <div className="space-y-2">
            <Label className="font-bengali">Google Analytics ID</Label>
            <Input
              value={settings.google_analytics_id}
              onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
              placeholder="যেমন: G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground font-bengali">
              Google Analytics 4 Measurement ID এখানে দিন।
            </p>
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
          <Textarea
            value={settings.custom_head_code}
            onChange={(e) => setSettings({ ...settings, custom_head_code: e.target.value })}
            rows={4}
            placeholder="<script>...</script> বা অন্য যেকোনো কোড"
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground font-bengali">
            এই কোড সাইটের &lt;head&gt; সেকশনে যোগ হবে। সতর্কতার সাথে ব্যবহার করুন।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
