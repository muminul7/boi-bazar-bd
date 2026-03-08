import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(errorPage("ডাউনলোড টোকেন পাওয়া যায়নি।"), {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find order by download token
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, books(*)")
      .eq("download_token", token)
      .eq("payment_status", "paid")
      .single();

    if (error || !order) {
      return new Response(errorPage("এই ডাউনলোড লিংকটি অবৈধ বা পেমেন্ট সম্পন্ন হয়নি।"), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Check expiry
    if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
      return new Response(errorPage("ডাউনলোড লিংকটির মেয়াদ শেষ হয়ে গেছে। (৪৮ ঘণ্টা)"), {
        status: 410,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Check download count
    const maxDownloads = order.max_downloads || 3;
    const downloadCount = order.download_count || 0;
    if (downloadCount >= maxDownloads) {
      return new Response(errorPage(`সর্বোচ্চ ${maxDownloads} বার ডাউনলোড সীমা অতিক্রম করেছেন।`), {
        status: 429,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Get the file URL from the book
    const fileUrl = order.books?.file_url;
    if (!fileUrl) {
      return new Response(errorPage("এই বইয়ের ফাইল এখনো আপলোড করা হয়নি। অনুগ্রহ করে যোগাযোগ করুন।"), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Increment download count
    await supabase
      .from("orders")
      .update({ download_count: downloadCount + 1 })
      .eq("id", order.id);

    // If file is in Supabase storage (starts with storage path), generate signed URL
    if (fileUrl.startsWith("ebooks/") || fileUrl.startsWith("/storage/")) {
      const filePath = fileUrl.replace(/^\/storage\/v1\/object\/public\//, "").replace(/^ebooks\//, "");
      const { data: signedData, error: signError } = await supabase
        .storage
        .from("ebooks")
        .createSignedUrl(filePath, 300); // 5 min signed URL

      if (signError || !signedData?.signedUrl) {
        console.error("Signed URL error:", signError);
        return new Response(errorPage("ফাইল ডাউনলোডে সমস্যা হয়েছে। অনুগ্রহ করে যোগাযোগ করুন।"), {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      return new Response(null, {
        status: 302,
        headers: { Location: signedData.signedUrl },
      });
    }

    // External URL - redirect directly
    return new Response(null, {
      status: 302,
      headers: { Location: fileUrl },
    });
  } catch (err) {
    console.error("Download error:", err);
    return new Response(errorPage("একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।"), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ডাউনলোড - বই বাজার</title></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="max-width:420px;background:#fff;border-radius:16px;padding:40px 32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="font-size:48px;margin-bottom:16px;">😔</div>
  <h2 style="color:#1e293b;margin:0 0 12px;">ডাউনলোড সমস্যা</h2>
  <p style="color:#64748b;line-height:1.6;margin:0 0 24px;">${message}</p>
  <a href="https://boi-bazar-bd.lovable.app" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;">হোমে ফিরে যান</a>
</div></body></html>`;
}
