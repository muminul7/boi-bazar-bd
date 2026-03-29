import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_FAVICON = "/favicon.ico";
const FAVICON_LINK_ID = "app-favicon";

type SiteLogoUpdatedEvent = CustomEvent<{ logoUrl?: string }>;

function updateFavicon(href: string) {
  let link = document.getElementById(FAVICON_LINK_ID) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.id = FAVICON_LINK_ID;
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = href;
}

export default function SiteFavicon() {
  const [faviconUrl, setFaviconUrl] = useState(DEFAULT_FAVICON);

  useEffect(() => {
    let isMounted = true;

    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_logo_url")
      .maybeSingle()
      .then(({ data }) => {
        if (!isMounted) return;
        setFaviconUrl(data?.value || DEFAULT_FAVICON);
      });

    const handleSiteLogoUpdated = (event: Event) => {
      const { detail } = event as SiteLogoUpdatedEvent;
      setFaviconUrl(detail?.logoUrl || DEFAULT_FAVICON);
    };

    window.addEventListener("site-logo-updated", handleSiteLogoUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("site-logo-updated", handleSiteLogoUpdated);
    };
  }, []);

  useEffect(() => {
    updateFavicon(faviconUrl);
  }, [faviconUrl]);

  return null;
}
