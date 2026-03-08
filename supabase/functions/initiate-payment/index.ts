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
    const { bookId, customerName, customerEmail, customerPhone, billingAddress, couponCode, amount, discount } = await req.json();

    if (!bookId || !customerName || !customerEmail || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create order in DB
    const downloadToken = crypto.randomUUID();
    const downloadExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      book_id: bookId,
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
    }).select().single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // SSLCommerz sandbox credentials from secrets
    const storeId = Deno.env.get("SSLCOMMERZ_STORE_ID") || "testp6aborjane67b4";
    const storePass = Deno.env.get("SSLCOMMERZ_STORE_PASSWORD") || "testp6@borjane67b4";
    const isSandbox = Deno.env.get("SSLCOMMERZ_SANDBOX") !== "false";

    const baseUrl = isSandbox
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com";

    // Get the origin for callbacks
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";

    // SSLCommerz payment init
    const formData = new URLSearchParams();
    formData.append("store_id", storeId);
    formData.append("store_passwd", storePass);
    formData.append("total_amount", amount.toString());
    formData.append("currency", "BDT");
    formData.append("tran_id", order.id);
    formData.append("success_url", `${supabaseUrl}/functions/v1/payment-webhook`);
    formData.append("fail_url", `${supabaseUrl}/functions/v1/payment-webhook`);
    formData.append("cancel_url", `${supabaseUrl}/functions/v1/payment-webhook`);
    formData.append("ipn_url", `${supabaseUrl}/functions/v1/payment-webhook`);
    formData.append("cus_name", customerName);
    formData.append("cus_email", customerEmail);
    formData.append("cus_phone", customerPhone || "01700000000");
    formData.append("cus_add1", billingAddress || "Dhaka");
    formData.append("cus_city", "Dhaka");
    formData.append("cus_country", "Bangladesh");
    formData.append("shipping_method", "NO");
    formData.append("product_name", "eBook");
    formData.append("product_category", "Digital");
    formData.append("product_profile", "non-physical-goods");

    // Store origin in order metadata for redirect after payment
    await supabase.from("orders").update({ billing_address: `${billingAddress || ""}|||${origin}` }).eq("id", order.id);

    const sslRes = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const sslData = await sslRes.json();

    if (sslData.status === "SUCCESS" || sslData.status === "success") {
      return new Response(JSON.stringify({
        success: true,
        gatewayUrl: sslData.GatewayPageURL,
        orderId: order.id,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      console.error("SSLCommerz error:", sslData);
      return new Response(JSON.stringify({ error: "Payment gateway error", details: sslData.failedreason || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
