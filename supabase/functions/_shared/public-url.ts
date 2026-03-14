function normalizeRawBaseUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function normalizePublicBaseUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const isLocalHttp =
      url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    const isPublicHttps = url.protocol === "https:";

    if (!isLocalHttp && !isPublicHttps) {
      return null;
    }

    return normalizeRawBaseUrl(url.origin);
  } catch {
    return null;
  }
}

export function resolveClientBaseUrl(req: Request, fallback: string): string {
  return (
    normalizePublicBaseUrl(req.headers.get("origin")) ??
    normalizePublicBaseUrl(req.headers.get("referer")) ??
    normalizePublicBaseUrl(fallback) ??
    normalizeRawBaseUrl(fallback)
  );
}

export function buildPaymentResultUrl(baseUrl: string, orderId: string, status: string): string {
  const redirectUrl = new URL("/payment-success", `${normalizeRawBaseUrl(baseUrl)}/`);
  redirectUrl.searchParams.set("order_id", orderId);
  redirectUrl.searchParams.set("status", status);
  return redirectUrl.toString();
}
