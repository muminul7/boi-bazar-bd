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
    const { bookId, customerName, customerEmail, customerPhone, billingAddress, couponCode } = await req.json();

    if (!customerName || !customerEmail || !bookId) {
      return new Response(JSON.stringify({ error: "Missing required fields: bookId, customerName, customerEmail" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- SERVER-SIDE PRICE VALIDATION ---
    // Fetch the real book price from the database
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, title, price, original_price, active")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (book.active === false) {
      return new Response(JSON.stringify({ error: "This book is currently unavailable" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let finalAmount = book.price;
    let appliedDiscount = 0;

    // --- SERVER-SIDE COUPON VALIDATION ---
    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("active", true)
        .single();

      if (coupon) {
        // Check expiry
        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
        // Check usage limit
        const isMaxedOut = coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses;

        if (!isExpired && !isMaxedOut) {
          if (coupon.discount_type === "percentage") {
            appliedDiscount = Math.round((book.price * coupon.discount_value) / 100);
          } else {
            appliedDiscount = coupon.discount_value;
          }
          // Ensure discount doesn't exceed price
          appliedDiscount = Math.min(appliedDiscount, book.price);
          finalAmount = book.price - appliedDiscount;
        }
      }
      // If coupon is invalid, we proceed without discount (no error, just ignore)
    }

    // Ensure minimum amount of 1 BDT
    if (finalAmount < 1) {
      finalAmount = 1;
    }

    // Create order in DB with server-computed amount
    const downloadToken = crypto.randomUUID();
    const downloadExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const invoiceNumber = `EK-${Date.now()}`;

    const { data: order, error: orderError } = await supabase.from("orders").insert({
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
    }).select().single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // PayStation credentials: try secure_settings first, fallback to env
    let merchantId = Deno.env.get("PAYSTATION_MERCHANT_ID");
    let password = Deno.env.get("PAYSTATION_PASSWORD");

    const { data: secSettings } = await supabase
      .from("secure_settings")
      .select("key, value")
      .in("key", ["paystation_merchant_id", "paystation_password"]);

    if (secSettings) {
      for (const row of secSettings) {
        if (row.key === "paystation_merchant_id" && row.value) merchantId = row.value;
        if (row.key === "paystation_password" && row.value) password = row.value;
      }
    }

    if (!merchantId || !password) {
      return new Response(JSON.stringify({ error: "Payment gateway not configured." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";

    // Generate HMAC signature using PAYSTATION_PASSWORD as key
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = Array.from(
      new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(invoiceNumber)))
    ).map(b => b.toString(16).padStart(2, "0")).join("");

    const callbackUrl = `${supabaseUrl}/functions/v1/payment-webhook?sig=${signature}`;

    // PayStation initiate-payment API
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
    formData.append("opt_a", origin);

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
