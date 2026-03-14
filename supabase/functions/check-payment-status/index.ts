import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAppConfig, getPaymentConfig } from "../_shared/config.ts";
import { createCorsResponse } from "../_shared/cors.ts";
import { toPaymentPageStatus, verifyPayStationPayment } from "../_shared/paystation.ts";

function jsonResponse(payload: unknown, status = 200): Response {
  return createCorsResponse(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function sendDeliveryEmail(supabaseUrl: string, supabaseServiceRoleKey: string, orderId: string) {
  try {
    const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-delivery-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({ orderId }),
    });

    const emailData = await emailRes.json();
    console.log("Delivery email result:", emailData);
  } catch (error) {
    console.error("Delivery email error:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse(null);
  }

  try {
    const url = new URL(req.url);
    let orderId = url.searchParams.get("orderId");

    if (!orderId && req.method !== "GET") {
      try {
        const body = await req.json();
        orderId = body.orderId ?? null;
      } catch {
        orderId = null;
      }
    }

    if (!orderId) {
      return jsonResponse({ error: "Missing orderId" }, 400);
    }

    const { supabaseUrl, supabaseServiceRoleKey } = getAppConfig();
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return jsonResponse({ error: "Order not found" }, 404);
    }

    if (order.payment_status === "paid" || order.payment_status === "cancelled") {
      return jsonResponse({
        orderId: order.id,
        status: toPaymentPageStatus(order.payment_status),
        paymentStatus: order.payment_status,
      });
    }

    const transactionId = typeof order.transaction_id === "string" ? order.transaction_id : null;
    const invoiceNumber = transactionId?.startsWith("EK-") ? transactionId : null;
    const trxId = transactionId && !transactionId.startsWith("EK-") ? transactionId : null;

    if (!invoiceNumber && !trxId) {
      return jsonResponse({
        orderId: order.id,
        status: "pending",
        paymentStatus: order.payment_status ?? "pending",
      });
    }

    const {
      paystationMerchantId,
      paystationTransactionStatusUrl,
      paystationTransactionStatusV2Url,
    } = getPaymentConfig();

    const verification = await verifyPayStationPayment({
      merchantId: paystationMerchantId,
      transactionStatusUrl: paystationTransactionStatusUrl,
      transactionStatusV2Url: paystationTransactionStatusV2Url,
      invoiceNumber,
      trxId,
      attempts: 2,
      retryDelayMs: 1200,
    });

    if (verification.state === "pending") {
      if (order.payment_status !== "pending_verification") {
        await supabase
          .from("orders")
          .update({ payment_status: "pending_verification" })
          .eq("id", order.id);
      }

      return jsonResponse({
        orderId: order.id,
        status: "pending",
        paymentStatus: "pending_verification",
        providerStatus: verification.providerStatus,
        message: verification.message,
      });
    }

    if (
      verification.amount !== null &&
      verification.amount > 0 &&
      Math.abs(verification.amount - order.amount) > 1
    ) {
      await supabase
        .from("orders")
        .update({ payment_status: "verification_failed" })
        .eq("id", order.id);

      return jsonResponse({
        orderId: order.id,
        status: "failed",
        paymentStatus: "verification_failed",
        message: "Amount mismatch detected during verification",
      });
    }

    if (verification.state !== "verified") {
      await supabase
        .from("orders")
        .update({ payment_status: "verification_failed" })
        .eq("id", order.id);

      return jsonResponse({
        orderId: order.id,
        status: "failed",
        paymentStatus: "verification_failed",
        providerStatus: verification.providerStatus,
        message: verification.message,
      });
    }

    const confirmedTransactionId = verification.trxId || trxId || invoiceNumber || transactionId;

    await supabase.from("orders").update({
      payment_status: "paid",
      transaction_id: confirmedTransactionId,
      payment_method: "PayStation",
    }).eq("id", order.id);

    if (order.coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("code", order.coupon_code)
        .single();

      if (coupon) {
        await supabase
          .from("coupons")
          .update({ used_count: (coupon.used_count || 0) + 1 })
          .eq("code", order.coupon_code);
      }
    }

    if (!order.delivery_email_sent) {
      await sendDeliveryEmail(supabaseUrl, supabaseServiceRoleKey, order.id);
    }

    return jsonResponse({
      orderId: order.id,
      status: "success",
      paymentStatus: "paid",
      transactionId: confirmedTransactionId,
    });
  } catch (error) {
    console.error("check-payment-status error:", error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "Internal error",
    }, 500);
  }
});
