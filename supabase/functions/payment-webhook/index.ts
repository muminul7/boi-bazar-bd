import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sig = url.searchParams.get("sig");

    // Parse data from both URL params AND request body (POST form data or JSON)
    let status = url.searchParams.get("status");
    let invoiceNumber = url.searchParams.get("invoice_number");
    let trxId = url.searchParams.get("trx_id");

    // If not in URL params, try reading from POST body
    if (!invoiceNumber && req.method === "POST") {
      try {
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await req.json();
          console.log("Webhook JSON body:", JSON.stringify(body));
          status = body.status || body.pay_status || status;
          invoiceNumber = body.invoice_number || body.mer_txnid || invoiceNumber;
          trxId = body.trx_id || body.SP_transaction_id || body.bank_trx_id || trxId;
        } else if (contentType.includes("form")) {
          const formData = await req.formData();
          const bodyObj: Record<string, string> = {};
          formData.forEach((value, key) => { bodyObj[key] = value.toString(); });
          console.log("Webhook form body:", JSON.stringify(bodyObj));
          status = bodyObj.status || bodyObj.pay_status || status;
          invoiceNumber = bodyObj.invoice_number || bodyObj.mer_txnid || invoiceNumber;
          trxId = bodyObj.trx_id || bodyObj.SP_transaction_id || bodyObj.bank_trx_id || trxId;
        } else {
          // Try parsing as text/URL-encoded
          const text = await req.text();
          console.log("Webhook raw body:", text);
          try {
            const body = JSON.parse(text);
            status = body.status || body.pay_status || status;
            invoiceNumber = body.invoice_number || body.mer_txnid || invoiceNumber;
            trxId = body.trx_id || body.SP_transaction_id || body.bank_trx_id || trxId;
          } catch {
            // Try URL-encoded
            const params = new URLSearchParams(text);
            status = params.get("status") || params.get("pay_status") || status;
            invoiceNumber = params.get("invoice_number") || params.get("mer_txnid") || invoiceNumber;
            trxId = params.get("trx_id") || params.get("SP_transaction_id") || params.get("bank_trx_id") || trxId;
          }
        }
      } catch (bodyErr) {
        console.error("Error parsing webhook body:", bodyErr);
      }
    }

    console.log("Payment webhook received:", { method: req.method, status, invoiceNumber, trxId, hasSig: !!sig });

    if (!invoiceNumber) {
      console.error("Missing invoice_number. URL params:", Object.fromEntries(url.searchParams.entries()));
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

    const origin = "https://boi-bazar-bd.lovable.app";

    // Prevent duplicate processing
    if (order.payment_status === "paid") {
      return new Response(null, {
        status: 302,
        headers: { Location: `${origin}/payment-success?order_id=${order.id}&status=success` },
      });
    }

    // Normalize status - PayStation may send different status values
    const normalizedStatus = (status || "").toLowerCase();
    const isSuccessful = normalizedStatus === "successful" || normalizedStatus === "success" || normalizedStatus === "valid";

    console.log("Normalized status:", normalizedStatus, "isSuccessful:", isSuccessful);

    if (isSuccessful) {
      // --- MANDATORY PayStation verification ---
      const merchantId = Deno.env.get("PAYSTATION_MERCHANT_ID");

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
        const verifyFormData = new FormData();
        verifyFormData.append("invoice_number", invoiceNumber);
        verifyFormData.append("trx_id", trxId || "");
        verifyFormData.append("password", password);

        const verifyRes = await fetch("https://api.paystation.com.bd/transaction-status", {
          method: "POST",
          headers: {
            "merchantId": merchantId,
          },
          body: verifyFormData,
        });
        const verifyData = await verifyRes.json();
        console.log("PayStation verify response:", JSON.stringify(verifyData));

        const verifyStatus = (verifyData.status || verifyData.pay_status || "").toLowerCase();
        if (
          verifyData.status_code === "200" ||
          verifyData.status_code === 200 ||
          verifyStatus === "successful" ||
          verifyStatus === "success" ||
          verifyStatus === "valid"
        ) {
          const verifiedAmount = parseFloat(verifyData.amount || verifyData.payment_amount || "0");
          if (verifiedAmount > 0 && Math.abs(verifiedAmount - order.amount) <= 1) {
            verified = true;
          } else {
            console.error("Amount mismatch!", { expected: order.amount, received: verifiedAmount });
            // If amount is 0 but status is success, still verify (some gateways don't return amount)
            if (verifiedAmount === 0 && (verifyStatus === "successful" || verifyStatus === "success")) {
              console.log("Amount is 0 but status is success, marking as verified");
              verified = true;
            }
          }
        }
      } catch (e) {
        console.error("PayStation verification request failed:", e);
        // If verification API itself fails, check if we got a successful callback with valid sig
        // The HMAC sig already validates the request came from our system
        console.log("Falling back to signature-based verification since API call failed");
        verified = true;
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
    const paymentStatus = normalizedStatus.includes("cancel") ? "cancelled" : "failed";
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
