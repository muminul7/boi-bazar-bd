import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const formData = await req.text();
    const params = new URLSearchParams(formData);

    const tranId = params.get("tran_id");
    const status = params.get("status");
    const valId = params.get("val_id");
    const amount = params.get("amount");
    const bankTranId = params.get("bank_tran_id");

    console.log("Payment webhook received:", { tranId, status, valId, amount });

    if (!tranId) {
      return new Response("Missing tran_id", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the order to extract origin for redirect
    const { data: order } = await supabase.from("orders").select("*").eq("id", tranId).single();

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    // Extract origin from billing_address hack
    let origin = "";
    let actualAddress = order.billing_address || "";
    if (actualAddress.includes("|||")) {
      const parts = actualAddress.split("|||");
      actualAddress = parts[0];
      origin = parts[1];
    }

    if (status === "VALID" || status === "VALIDATED") {
      // Validate with SSLCommerz
      const storeId = Deno.env.get("SSLCOMMERZ_STORE_ID") || "testbox";
      const storePass = Deno.env.get("SSLCOMMERZ_STORE_PASSWORD") || "qwerty";
      const isSandbox = Deno.env.get("SSLCOMMERZ_SANDBOX") !== "false";
      const baseUrl = isSandbox
        ? "https://sandbox.sslcommerz.com"
        : "https://securepay.sslcommerz.com";

      // Validate transaction
      const validateUrl = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePass}&format=json`;
      const validateRes = await fetch(validateUrl);
      const validateData = await validateRes.json();

      if (validateData.status === "VALID" || validateData.status === "VALIDATED") {
        // Update order as paid
        await supabase.from("orders").update({
          payment_status: "paid",
          transaction_id: bankTranId || valId,
          payment_method: params.get("card_type") || "SSLCommerz",
          billing_address: actualAddress,
        }).eq("id", tranId);

        // Update coupon usage if applicable
        if (order.coupon_code) {
          await supabase.rpc("increment_coupon_usage", { coupon_code: order.coupon_code });
        }

        // Redirect to success page
        const redirectUrl = origin
          ? `${origin}/payment-success?order_id=${tranId}&status=success`
          : `${supabaseUrl}/payment-success?order_id=${tranId}&status=success`;

        return new Response(null, {
          status: 302,
          headers: { Location: redirectUrl },
        });
      }
    }

    // Failed or cancelled
    const paymentStatus = status === "FAILED" ? "failed" : status === "CANCELLED" ? "cancelled" : "failed";
    await supabase.from("orders").update({
      payment_status: paymentStatus,
      billing_address: actualAddress,
    }).eq("id", tranId);

    const redirectUrl = origin
      ? `${origin}/payment-success?order_id=${tranId}&status=${paymentStatus}`
      : `${supabaseUrl}/payment-success?status=${paymentStatus}`;

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
