import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const invoiceNumber = url.searchParams.get("invoice_number");
    const trxId = url.searchParams.get("trx_id");
    const sig = url.searchParams.get("sig");

    console.log("Payment webhook received:", { status, invoiceNumber, trxId, hasSig: !!sig });

    if (!invoiceNumber) {
      return new Response("Missing invoice_number", { status: 400 });
    }

    // --- HMAC Signature Validation ---
    const password = Deno.env.get("PAYSTATION_PASSWORD");
    if (!password || !sig) {
      console.error("Missing PAYSTATION_PASSWORD or signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSig = Array.from(
      new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(invoiceNumber)))
    ).map(b => b.toString(16).padStart(2, "0")).join("");

    if (sig !== expectedSig) {
      console.error("Invalid webhook signature!", { expected: expectedSig, received: sig });
      return new Response("Forbidden", { status: 403 });
    }
    console.log("Webhook signature verified successfully");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find order by invoice number
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("transaction_id", invoiceNumber)
      .single();

    if (!order) {
      console.error("Order not found for invoice:", invoiceNumber);
      return new Response("Order not found", { status: 404 });
    }

    // Prevent duplicate processing - if already paid, just redirect
    if (order.payment_status === "paid") {
      const origin = "https://boi-bazar-bd.lovable.app";
      return new Response(null, {
        status: 302,
        headers: { Location: `${origin}/payment-success?order_id=${order.id}&status=success` },
      });
    }

    const origin = "https://boi-bazar-bd.lovable.app";

    if (status === "Successful") {
      // --- MANDATORY PayStation verification ---
      const merchantId = Deno.env.get("PAYSTATION_MERCHANT_ID");
      const password = Deno.env.get("PAYSTATION_PASSWORD");

      if (!merchantId || !password) {
        console.error("PayStation credentials missing, cannot verify payment");
        await supabase.from("orders").update({ payment_status: "verification_failed" }).eq("id", order.id);
        return new Response(null, {
          status: 302,
          headers: { Location: `${origin}/payment-success?order_id=${order.id}&status=failed` },
        });
      }

      // Verify the transaction with PayStation
      let verified = false;
      try {
        const verifyRes = await fetch("https://api.paystation.com.bd/transaction-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "merchantId": merchantId,
          },
          body: JSON.stringify({ invoice_number: invoiceNumber }),
        });
        const verifyData = await verifyRes.json();
        console.log("PayStation verify response:", verifyData);

        // Only mark as paid if PayStation confirms the transaction is successful
        // and the amount matches what we expect
        if (
          verifyData.status_code === "200" ||
          verifyData.status === "Successful" ||
          verifyData.status === "success"
        ) {
          // Verify the amount matches to prevent partial payment fraud
          const verifiedAmount = parseFloat(verifyData.amount || verifyData.payment_amount || "0");
          if (verifiedAmount > 0 && Math.abs(verifiedAmount - order.amount) <= 1) {
            verified = true;
          } else {
            console.error("Amount mismatch!", { expected: order.amount, received: verifiedAmount });
          }
        }
      } catch (e) {
        console.error("PayStation verification failed:", e);
      }

      if (!verified) {
        console.error("Payment verification FAILED for invoice:", invoiceNumber);
        await supabase.from("orders").update({ payment_status: "verification_failed" }).eq("id", order.id);
        return new Response(null, {
          status: 302,
          headers: { Location: `${origin}/payment-success?order_id=${order.id}&status=failed` },
        });
      }

      // Verification passed — mark as paid
      await supabase.from("orders").update({
        payment_status: "paid",
        transaction_id: trxId || invoiceNumber,
        payment_method: "PayStation",
      }).eq("id", order.id);

      // Update coupon usage if applicable
      if (order.coupon_code) {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("used_count")
          .eq("code", order.coupon_code)
          .single();
        if (coupon) {
          await supabase.from("coupons")
            .update({ used_count: (coupon.used_count || 0) + 1 })
            .eq("code", order.coupon_code);
        }
      }

      // Send delivery email
      try {
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-delivery-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ orderId: order.id }),
        });
        const emailData = await emailRes.json();
        console.log("Delivery email result:", emailData);
      } catch (emailErr) {
        console.error("Delivery email error:", emailErr);
      }

      return new Response(null, {
        status: 302,
        headers: { Location: `${origin}/payment-success?order_id=${order.id}&status=success` },
      });
    }

    // Failed or Cancelled
    const paymentStatus = status === "Failed" ? "failed" : status === "Canceled" ? "cancelled" : "failed";
    await supabase.from("orders").update({
      payment_status: paymentStatus,
    }).eq("id", order.id);

    return new Response(null, {
      status: 302,
      headers: { Location: `${origin}/payment-success?order_id=${order.id}&status=${paymentStatus}` },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
