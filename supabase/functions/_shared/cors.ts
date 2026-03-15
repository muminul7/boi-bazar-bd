const baseCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-info, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export function withCorsHeaders(headers: HeadersInit = {}, req?: Request): Headers {
  const mergedHeaders = new Headers(baseCorsHeaders);
  const additionalHeaders = new Headers(headers);

  if (req) {
    const requestOrigin = req.headers.get("origin");
    const requestHeaders = req.headers.get("access-control-request-headers");

    if (requestOrigin) {
      mergedHeaders.set("Access-Control-Allow-Origin", requestOrigin);
      mergedHeaders.set("Vary", "Origin, Access-Control-Request-Headers");
    }

    if (requestHeaders && requestHeaders.trim().length > 0) {
      mergedHeaders.set("Access-Control-Allow-Headers", requestHeaders);
    }

    if (req.headers.get("access-control-request-private-network") === "true") {
      mergedHeaders.set("Access-Control-Allow-Private-Network", "true");
    }
  }

  additionalHeaders.forEach((value, key) => {
    mergedHeaders.set(key, value);
  });

  return mergedHeaders;
}

export function createCorsResponse(body: BodyInit | null, init: ResponseInit = {}, req?: Request): Response {
  return new Response(body, {
    ...init,
    headers: withCorsHeaders(init.headers, req),
  });
}

export const corsHeaders = baseCorsHeaders;
