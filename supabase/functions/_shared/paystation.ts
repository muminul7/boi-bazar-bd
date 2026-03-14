export type VerificationState = "verified" | "pending" | "failed";

export type VerificationResult = {
  state: VerificationState;
  amount: number | null;
  providerStatus: string;
  message: string;
  trxId: string | null;
  invoiceNumber: string | null;
  raw: unknown;
};

type VerifyOptions = {
  merchantId: string;
  transactionStatusUrl: string;
  transactionStatusV2Url: string;
  invoiceNumber?: string | null;
  trxId?: string | null;
  attempts?: number;
  retryDelayMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseVerificationResult(raw: any): VerificationResult {
  const nested = raw?.data ?? raw?.transaction ?? raw;
  const topStatus = String(raw?.status ?? raw?.pay_status ?? "").trim().toLowerCase();
  const trxStatus = String(
    nested?.trx_status ??
    nested?.status ??
    raw?.trx_status ??
    ""
  ).trim().toLowerCase();
  const providerStatus = trxStatus || topStatus;
  const message = String(raw?.message ?? nested?.message ?? "").trim();
  const messageLower = message.toLowerCase();
  const code = String(raw?.status_code ?? "").trim();
  const amount = parseAmount(
    nested?.payment_amount ??
    nested?.amount ??
    nested?.request_amount ??
    raw?.payment_amount ??
    raw?.amount
  );
  const trxId = String(
    nested?.trx_id ??
    nested?.trxId ??
    raw?.trx_id ??
    raw?.trxId ??
    raw?.SP_transaction_id ??
    ""
  ).trim() || null;
  const invoiceNumber = String(
    nested?.invoice_number ??
    nested?.invoiceNumber ??
    raw?.invoice_number ??
    raw?.invoiceNumber ??
    raw?.mer_txnid ??
    ""
  ).trim() || null;

  if (code === "2001" && messageLower.includes("not found")) {
    return { state: "pending", amount, providerStatus, message, trxId, invoiceNumber, raw };
  }

  if (
    providerStatus.includes("pending") ||
    providerStatus.includes("process") ||
    messageLower.includes("processing")
  ) {
    return { state: "pending", amount, providerStatus, message, trxId, invoiceNumber, raw };
  }

  if (
    ["successful", "success", "valid", "completed", "paid"].includes(providerStatus) ||
    ["successful", "success", "valid", "completed", "paid"].includes(topStatus)
  ) {
    return { state: "verified", amount, providerStatus, message, trxId, invoiceNumber, raw };
  }

  if (
    ["failed", "cancelled", "canceled", "declined", "invalid", "reversed"].includes(providerStatus) ||
    ["failed", "cancelled", "canceled", "declined", "invalid", "reversed"].includes(topStatus)
  ) {
    return { state: "failed", amount, providerStatus, message, trxId, invoiceNumber, raw };
  }

  return { state: "pending", amount, providerStatus, message, trxId, invoiceNumber, raw };
}

async function fetchVerificationPayload(url: string, init: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Unexpected PayStation verification response: ${text}`);
  }
}

export async function verifyPayStationPayment({
  merchantId,
  transactionStatusUrl,
  transactionStatusV2Url,
  invoiceNumber,
  trxId,
  attempts = 3,
  retryDelayMs = 1500,
}: VerifyOptions): Promise<VerificationResult> {
  let lastResult: VerificationResult = {
    state: "pending",
    amount: null,
    providerStatus: "",
    message: "Verification not completed yet",
    trxId: trxId || null,
    invoiceNumber: invoiceNumber || null,
    raw: null,
  };

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const requests: Array<() => Promise<any>> = [];

    if (trxId) {
      requests.push(() =>
        fetchVerificationPayload(transactionStatusV2Url, {
          method: "POST",
          headers: {
            merchantId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trxId }),
        })
      );
    }

    if (invoiceNumber) {
      requests.push(() =>
        fetchVerificationPayload(transactionStatusUrl, {
          method: "POST",
          headers: {
            merchantId,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ invoice_number: invoiceNumber }),
        })
      );
    }

    for (const request of requests) {
      try {
        const raw = await request();
        const parsed = parseVerificationResult(raw);
        console.log("PayStation verify response:", JSON.stringify(raw));

        if (parsed.state === "verified" || parsed.state === "failed") {
          return parsed;
        }

        lastResult = parsed;
      } catch (error) {
        console.error("PayStation verification request failed:", error);
        lastResult = {
          state: "pending",
          amount: null,
          providerStatus: "",
          message: error instanceof Error ? error.message : "Verification request failed",
          trxId: trxId || null,
          invoiceNumber: invoiceNumber || null,
          raw: null,
        };
      }
    }

    if (attempt < attempts - 1) {
      await sleep((attempt + 1) * retryDelayMs);
    }
  }

  return lastResult;
}

export function toPaymentPageStatus(paymentStatus: string | null): "success" | "pending" | "failed" | "cancelled" {
  switch (paymentStatus) {
    case "paid":
      return "success";
    case "pending":
    case "pending_verification":
      return "pending";
    case "cancelled":
      return "cancelled";
    default:
      return "failed";
  }
}
