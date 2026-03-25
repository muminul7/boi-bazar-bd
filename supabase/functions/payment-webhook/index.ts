import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAppConfig, getEnv } from "../_shared/config.ts";
import { createCorsResponse } from "../_shared/cors.ts";
import { buildPaymentResultUrl, normalizePublicBaseUrl } from "../_shared/public-url.ts";

function createPaymentRedirectResponse(baseUrl: string, orderId: string, status: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: buildPaymentResultUrl(baseUrl, orderId, status) },
  });
}

async function finalizeSuccessfulPayment(
  supabase: ReturnType<typeof createClient>,
  order: any,
  transactionId: string,
  supabaseUrl: string,
  supabaseServiceRoleKey: string,
) {
  await supabase.from("orders").update({
    payment_status: "paid",
    transaction_id: transactionId,
    payment_method: "PayStation",
  }).eq("id", order.id);

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

  try {
    const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-delivery-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({ orderId: order.id }),
    });
    const emailData = await emailRes.json();
    console.log("Delivery email result:", emailData);
  } catch (emailErr) {
    console.error("Delivery email error:", emailErr);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse(null);
  }

  try {
    const url = new URL(req.url);
    const sig = url.searchParams.get("sig");
    let returnTo = url.searchParams.get("return_to") || url.searchParams.get("opt_a");

    let status = url.searchParams.get("status") || url.searchParams.get("pay_status");
    let invoiceNumber = url.searchParams.get("invoice_number") || url.searchParams.get("mer_txnid");
    let trxId =
      url.searchParams.get("trx_id") ||
      url.searchParams.get("SP_transaction_id") ||
      url.searchParams.get("bank_trx_id");

    if (!invoiceNumber && req.method === "POST") {
      try {
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await req.json();
          console.log("Webhook JSON body:", JSON.stringify(body));
          status = body.status || body.pay_status || status;
          invoiceNumber = body.invoice_number || body.mer_txnid || invoiceNumber;
          trxId = body.trx_id || body.SP_transaction_id || body.bank_trx_id || trxId;
          returnTo = body.return_to || body.opt_a || returnTo;
        } else if (contentType.includes("form")) {
          const formData = await req.formData();
          const bodyObj: Record<string, string> = {};
          formData.forEach((value, key) => {
            bodyObj[key] = value.toString();
          });
          console.log("Webhook form body:", JSON.stringify(bodyObj));
          status = bodyObj.status || bodyObj.pay_status || status;
          invoiceNumber = bodyObj.invoice_number || bodyObj.mer_txnid || invoiceNumber;
          trxId = bodyObj.trx_id || bodyObj.SP_transaction_id || bodyObj.bank_trx_id || trxId;
          returnTo = bodyObj.return_to || bodyObj.opt_a || returnTo;
        } else {
          const text = await req.text();
          console.log("Webhook raw body:", text);
          try {
            const body = JSON.parse(text);
            status = body.status || body.pay_status || status;
            invoiceNumber = body.invoice_number || body.mer_txnid || invoiceNumber;
            trxId = body.trx_id || body.SP_transaction_id || body.bank_trx_id || trxId;
            returnTo = body.return_to || body.opt_a || returnTo;
          } catch {
            const params = new URLSearchParams(text);
            status = params.get("status") || params.get("pay_status") || status;
            invoiceNumber = params.get("invoice_number") || params.get("mer_txnid") || invoiceNumber;
            trxId = params.get("trx_id") || params.get("SP_transaction_id") || params.get("bank_trx_id") || trxId;
            returnTo = params.get("return_to") || params.get("opt_a") || returnTo;
          }
        }
      } catch (bodyErr) {
        console.error("Error parsing webhook body:", bodyErr);
      }
    }

    console.log("Payment webhook received:", {
      method: req.method,
      status,
      invoiceNumber,
      trxId,
      hasSig: !!sig,
      query: Object.fromEntries(url.searchParams.entries()),
    });

    if (!invoiceNumber) {
      console.error("Missing invoice_number. URL params:", Object.fromEntries(url.searchParams.entries()));
      return new Response("Missing invoice_number", { status: 400 });
    }

    const password = getEnv("PAYSTATION_PASSWORD");
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
    ).map((b) => b.toString(16).padStart(2, "0")).join("");

    if (sig !== expectedSig) {
      console.error("Invalid webhook signature!", { expected: expectedSig, received: sig });
      return new Response("Forbidden", { status: 403 });
    }
    console.log("Webhook signature verified successfully");

    const { appBaseUrl, supabaseUrl, supabaseServiceRoleKey } = getAppConfig();
    const redirectBaseUrl = normalizePublicBaseUrl(returnTo) ?? appBaseUrl;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const transactionCandidates = [invoiceNumber, trxId].filter((value): value is string => Boolean(value));
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .in("transaction_id", transactionCandidates)
      .limit(1);

    const order = orders?.[0];

    if (!order) {
      console.error("Order not found for invoice:", invoiceNumber);
      return new Response("Order not found", { status: 404 });
    }

    if (order.payment_status === "paid") {
      return createPaymentRedirectResponse(redirectBaseUrl, order.id, "success");
    }

    const normalizedStatus = (status || "").toLowerCase();
    const isSuccessful = normalizedStatus === "successful" || normalizedStatus === "success" || normalizedStatus === "valid";

    console.log("Normalized status:", normalizedStatus, "isSuccessful:", isSuccessful);

    if (isSuccessful) {
      const confirmedTransactionId = trxId || invoiceNumber;
      await finalizeSuccessfulPayment(
        supabase,
        order,
        confirmedTransactionId,
        supabaseUrl,
        supabaseServiceRoleKey,
      );

      return createPaymentRedirectResponse(redirectBaseUrl, order.id, "success");
    }

    const paymentStatus = normalizedStatus.includes("cancel") ? "cancelled" : "failed";
    await supabase.from("orders").update({
      payment_status: paymentStatus,
    }).eq("id", order.id);

    return createPaymentRedirectResponse(redirectBaseUrl, order.id, paymentStatus);
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
