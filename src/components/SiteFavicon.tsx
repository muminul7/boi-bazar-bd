import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_FAVICON = "/favicon.ico";
const FAVICON_LINKS = [
  { id: "app-favicon", rel: "icon" },
  { id: "app-shortcut-favicon", rel: "shortcut icon" },
];

function getVersionedFaviconUrl(href: string, updatedAt?: string) {
  if (!updatedAt || href === DEFAULT_FAVICON) {
    return href;
  }

  try {
    const url = new URL(href, window.location.origin);
    url.searchParams.set("v", updatedAt);
    return url.toString();
  } catch {
    return href;
  }
}

function updateFavicon(href: string) {
  FAVICON_LINKS.forEach(({ id, rel }) => {
    let link = document.getElementById(id) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = rel;
      document.head.appendChild(link);
    }

    link.href = href;
  });
}

export default function SiteFavicon() {
  const [faviconUrl, setFaviconUrl] = useState(DEFAULT_FAVICON);

  useEffect(() => {
    let isMounted = true;

    supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "site_logo_url")
      .maybeSingle()
      .then(({ data }) => {
        if (!isMounted) return;
        setFaviconUrl(getVersionedFaviconUrl(data?.value || DEFAULT_FAVICON, data?.updated_at));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    updateFavicon(faviconUrl);
  }, [faviconUrl]);

  return null;
}
