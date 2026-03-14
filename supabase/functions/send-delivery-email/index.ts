import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAppConfig, getEmailConfig } from "../_shared/config.ts";
import { createCorsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse(null);
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return createCorsResponse(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabaseUrl, supabaseServiceRoleKey } = getAppConfig();
    const { resendApiKey, resendFromEmail } = getEmailConfig();
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch order with book details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, books(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return createCorsResponse(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (order.delivery_email_sent) {
      return createCorsResponse(JSON.stringify({ message: "Email already sent" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build secure download URL
    const downloadUrl = `${supabaseUrl}/functions/v1/download-ebook?token=${order.download_token}`;

    const bookTitle = order.books?.title || "আপনার ই-বুক";
    const bookAuthor = order.books?.author || "";
    const bookCover = order.books?.cover_url || "";
    const customerName = order.customer_name;

    // HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;">📚 বই বাজার</h1>
      <p style="margin:8px 0 0;color:#ccfbf1;font-size:14px;">আপনার ই-বুক রেডি!</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="color:#1e293b;font-size:16px;margin:0 0 16px;">
        প্রিয় <strong>${customerName}</strong>,
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
        আপনার পেমেন্ট সফল হয়েছে! নিচের বাটনে ক্লিক করে আপনার বই ডাউনলোড করুন।
      </p>

      <!-- Book Card -->
      <div style="background:#f0fdfa;border:1px solid #ccfbf1;border-radius:12px;padding:16px;margin:0 0 24px;display:flex;">
        ${bookCover ? `<img src="${bookCover}" alt="${bookTitle}" style="width:60px;height:80px;object-fit:cover;border-radius:8px;margin-right:16px;">` : ""}
        <div>
          <h3 style="margin:0 0 4px;color:#0f766e;font-size:16px;">${bookTitle}</h3>
          ${bookAuthor ? `<p style="margin:0;color:#64748b;font-size:13px;">লেখক: ${bookAuthor}</p>` : ""}
          <p style="margin:4px 0 0;color:#64748b;font-size:13px;">মূল্য: ৳${order.amount}</p>
        </div>
      </div>

      <!-- Download Button -->
      <div style="text-align:center;margin:0 0 24px;">
        <a href="${downloadUrl}" style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0f766e);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:bold;">
          📥 ডাউনলোড করুন
        </a>
      </div>

      <!-- Info Box -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin:0 0 16px;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
          ⏰ <strong>ডাউনলোড লিংক ৪৮ ঘণ্টা পর্যন্ত ভ্যালিড</strong><br>
          🔄 সর্বোচ্চ <strong>${order.max_downloads || 3} বার</strong> ডাউনলোড করতে পারবেন<br>
          🔒 এই লিংক শুধুমাত্র আপনার জন্য
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:24px 0 0;">
        অর্ডার ID: ${order.id.slice(0, 8)}... | ${new Date().toLocaleDateString("bn-BD")}
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন
      </p>
    </div>
  </div>
</body>
</html>`;

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `বই বাজার <${resendFromEmail}>`,
        to: [order.customer_email],
        subject: `📚 "${bookTitle}" — আপনার ই-বুক ডাউনলোড করুন`,
        html: emailHtml,
      }),
    });

    const emailData = await emailRes.json();
    console.log("Resend response:", emailData);

    if (emailRes.ok) {
      // Mark email as sent
      await supabase.from("orders").update({ delivery_email_sent: true }).eq("id", orderId);

      return createCorsResponse(JSON.stringify({ success: true, emailId: emailData.id }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.error("Resend error:", emailData);
      return createCorsResponse(JSON.stringify({ error: "Failed to send email", details: emailData }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return createCorsResponse(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
