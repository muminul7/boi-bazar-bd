const baseCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-info, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export function withCorsHeaders(headers: HeadersInit = {}): Headers {
  const mergedHeaders = new Headers(baseCorsHeaders);
  const additionalHeaders = new Headers(headers);

  additionalHeaders.forEach((value, key) => {
    mergedHeaders.set(key, value);
  });

  return mergedHeaders;
}

export function createCorsResponse(body: BodyInit | null, init: ResponseInit = {}): Response {
  return new Response(body, {
    ...init,
    headers: withCorsHeaders(init.headers),
  });
}

export const corsHeaders = baseCorsHeaders;
