import { createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

type JsonRecord = Record<string, unknown>;

type PaymentRequestBody = {
  bookId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: string;
  couponCode?: string | null;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function json(res: any, status: number, body: JsonRecord) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.send(JSON.stringify(body));
}

function normalizeRawBaseUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizePublicBaseUrl(value: string | null | undefined): string | null {
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

function resolveClientBaseUrl(req: any, fallback: string): string {
  return (
    normalizePublicBaseUrl(req.headers.origin) ??
    normalizePublicBaseUrl(req.headers.referer) ??
    normalizePublicBaseUrl(fallback) ??
    normalizeRawBaseUrl(fallback)
  );
}

function parseRequestBody(body: unknown): PaymentRequestBody {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body) as PaymentRequestBody;
    } catch {
      return {};
    }
  }

  return body as PaymentRequestBody;
}

async function readPaystationResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = parseRequestBody(req.body);
    const { bookId, customerName, customerEmail, customerPhone, billingAddress, couponCode } = body;

    if (!bookId || !customerName || !customerEmail) {
      json(res, 400, { error: "Missing required fields: bookId, customerName, customerEmail" });
      return;
    }

    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const merchantId = getRequiredEnv("PAYSTATION_MERCHANT_ID");
    const password = getRequiredEnv("PAYSTATION_PASSWORD");
    const appBaseUrl = process.env.APP_BASE_URL || "https://eboi.shop";
    const paystationApiBaseUrl = trimTrailingSlash(
      process.env.PAYSTATION_API_BASE_URL || "https://api.paystation.com.bd",
    );

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, title, price, active")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      json(res, 404, { error: "Book not found" });
      return;
    }

    if (book.active === false) {
      json(res, 400, { error: "This book is currently unavailable" });
      return;
    }

    let finalAmount = book.price;
    let appliedDiscount = 0;

    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("active", true)
        .single();

      if (coupon) {
        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
        const isMaxedOut = coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses;

        if (!isExpired && !isMaxedOut) {
          appliedDiscount =
            coupon.discount_type === "percentage"
              ? Math.round((book.price * coupon.discount_value) / 100)
              : coupon.discount_value;

          appliedDiscount = Math.min(appliedDiscount, book.price);
          finalAmount = book.price - appliedDiscount;
        }
      }
    }

    if (finalAmount < 1) {
      finalAmount = 1;
    }

    const downloadToken = randomUUID();
    const downloadExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const invoiceNumber = `EK-${Date.now()}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        book_id: bookId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        billing_address: billingAddress || null,
        coupon_code: couponCode || null,
        amount: finalAmount,
        discount: appliedDiscount,
        payment_status: "pending",
        download_token: downloadToken,
        download_expires_at: downloadExpiresAt,
        transaction_id: invoiceNumber,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      json(res, 500, { error: "Failed to create order" });
      return;
    }

    const returnToBaseUrl = resolveClientBaseUrl(req, appBaseUrl);
    const signature = createHmac("sha256", password).update(invoiceNumber).digest("hex");
    const callbackParams = new URLSearchParams({
      sig: signature,
      return_to: returnToBaseUrl,
    });
    const callbackUrl = `${supabaseUrl}/functions/v1/payment-webhook?${callbackParams.toString()}`;

    const formData = new FormData();
    formData.append("merchantId", merchantId);
    formData.append("password", password);
    formData.append("invoice_number", invoiceNumber);
    formData.append("currency", "BDT");
    formData.append("payment_amount", finalAmount.toString());
    formData.append("reference", `Order: ${order.id}`);
    formData.append("cust_name", customerName);
    formData.append("cust_phone", customerPhone || "01700000000");
    formData.append("cust_email", customerEmail);
    formData.append("cust_address", billingAddress || "Bangladesh");
    formData.append("callback_url", callbackUrl);
    formData.append("checkout_items", JSON.stringify({ book: book.title, orderId: order.id }));
    formData.append("opt_a", returnToBaseUrl);

    const payRes = await fetch(`${paystationApiBaseUrl}/initiate-payment`, {
      method: "POST",
      body: formData,
    });
    const payData = await readPaystationResponse(payRes);

    if (
      payRes.ok &&
      typeof payData === "object" &&
      payData &&
      ("status_code" in payData || "status" in payData) &&
      ((payData as JsonRecord).status_code === "200" || (payData as JsonRecord).status === "success")
    ) {
      json(res, 200, {
        success: true,
        gatewayUrl: (payData as JsonRecord).payment_url,
        orderId: order.id,
        invoiceNumber,
      });
      return;
    }

    console.error("PayStation initiate-payment error:", payData);
    json(res, 500, {
      error: "Payment gateway error",
      details:
        typeof payData === "object" && payData && "message" in payData
          ? String((payData as JsonRecord).message)
          : "Unknown error",
    });
  } catch (error) {
    console.error("Vercel initiate-payment error:", error);
    json(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error",
    });
  }
}
