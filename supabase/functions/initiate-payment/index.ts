import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookId, bookTitle, customerName, customerEmail, customerPhone, billingAddress, couponCode, amount, discount } = await req.json();

    if (!customerName || !customerEmail || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create order in DB
    const downloadToken = crypto.randomUUID();
    const downloadExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const invoiceNumber = `EK-${Date.now()}`;

    // Check if bookId is a valid UUID (DB book) or static ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isDbBook = bookId && uuidRegex.test(bookId);

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      book_id: isDbBook ? bookId : null,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      billing_address: billingAddress || null,
      coupon_code: couponCode || null,
      amount,
      discount: discount || 0,
      payment_status: "pending",
      download_token: downloadToken,
      download_expires_at: downloadExpiresAt,
      transaction_id: invoiceNumber,
    }).select().single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // PayStation credentials from secrets
    const merchantId = Deno.env.get("PAYSTATION_MERCHANT_ID");
    const password = Deno.env.get("PAYSTATION_PASSWORD");

    if (!merchantId || !password) {
      return new Response(JSON.stringify({ error: "Payment gateway not configured. Set PAYSTATION_MERCHANT_ID and PAYSTATION_PASSWORD in secrets." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get the origin for callback redirect
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";

    // Store origin in opt_a for callback redirect
    const callbackUrl = `${supabaseUrl}/functions/v1/payment-webhook`;

    // PayStation initiate-payment API
    const formData = new FormData();
    formData.append("merchantId", merchantId);
    formData.append("password", password);
    formData.append("invoice_number", invoiceNumber);
    formData.append("currency", "BDT");
    formData.append("payment_amount", amount.toString());
    formData.append("reference", `Order: ${order.id}`);
    formData.append("cust_name", customerName);
    formData.append("cust_phone", customerPhone || "01700000000");
    formData.append("cust_email", customerEmail);
    formData.append("cust_address", billingAddress || "Bangladesh");
    formData.append("callback_url", callbackUrl);
    formData.append("checkout_items", JSON.stringify({ book: bookTitle || "eBook", orderId: order.id }));
    formData.append("opt_a", origin); // Store origin for redirect after callback

    const payRes = await fetch("https://api.paystation.com.bd/initiate-payment", {
      method: "POST",
      body: formData,
    });

    const payData = await payRes.json();
    console.log("PayStation response:", payData);

    if (payData.status_code === "200" || payData.status === "success") {
      return new Response(JSON.stringify({
        success: true,
        gatewayUrl: payData.payment_url,
        orderId: order.id,
        invoiceNumber,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      console.error("PayStation error:", payData);
      return new Response(JSON.stringify({ error: "Payment gateway error", details: payData.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
