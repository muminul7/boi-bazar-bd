import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function TrackingScripts() {
  const [pixelId, setPixelId] = useState<string | null>(null);
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["facebook_pixel_id", "google_analytics_id"]);

      data?.forEach((row: any) => {
        if (row.key === "facebook_pixel_id" && row.value) setPixelId(row.value);
        if (row.key === "google_analytics_id" && row.value) setGaId(row.value);
      });
    };
    load();
  }, []);

  useEffect(() => {
    if (!pixelId) return;
    // Inject Facebook Pixel
    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','${pixelId}');fbq('track','PageView');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement("noscript");
    const img = document.createElement("img");
    img.height = 1;
    img.width = 1;
    img.style.display = "none";
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);

    return () => {
      document.head.removeChild(script);
      document.body.removeChild(noscript);
    };
  }, [pixelId]);

  useEffect(() => {
    if (!gaId) return;
    const gtagScript = document.createElement("script");
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      window.dataLayer=window.dataLayer||[];
      function gtag(){dataLayer.push(arguments);}
      gtag('js',new Date());gtag('config','${gaId}');
    `;
    document.head.appendChild(inlineScript);

    return () => {
      document.head.removeChild(gtagScript);
      document.head.removeChild(inlineScript);
    };
  }, [gaId]);

  return null;
}
