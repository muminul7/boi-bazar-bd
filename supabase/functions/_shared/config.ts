export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEnv(name: string, fallback = ""): string {
  const value = Deno.env.get(name);
  return value && value.length > 0 ? value : fallback;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === "\"" && last === "\"") || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1);
    }
  }

  return trimmed;
}

function parseInteger(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export function getAppConfig() {
  return {
    appName: getEnv("APP_NAME", "eBoi"),
    appBaseUrl: getEnv("APP_BASE_URL", "https://eboi.shop"),
    supabaseUrl: requireEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getPaymentConfig() {
  const paystationApiBaseUrl = trimTrailingSlash(
    getEnv("PAYSTATION_API_BASE_URL", "https://api.paystation.com.bd")
  );

  return {
    paystationMerchantId: requireEnv("PAYSTATION_MERCHANT_ID"),
    paystationPassword: requireEnv("PAYSTATION_PASSWORD"),
    paystationApiBaseUrl,
    paystationInitiatePaymentUrl: `${paystationApiBaseUrl}/initiate-payment`,
    paystationTransactionStatusUrl: `${paystationApiBaseUrl}/transaction-status`,
    paystationTransactionStatusV2Url: `${paystationApiBaseUrl}/v2/transaction-status`,
  };
}

export function getEmailConfig() {
  const smtpUser = stripWrappingQuotes(requireEnv("SMTP_USER"));

  return {
    smtpHost: stripWrappingQuotes(requireEnv("SMTP_HOST")),
    smtpPort: parseInteger(getEnv("SMTP_PORT", "465"), 465),
    smtpUser,
    smtpPass: stripWrappingQuotes(requireEnv("SMTP_PASS")),
    smtpSecure: parseBoolean(Deno.env.get("SMTP_SECURE"), true),
    mailFromName: stripWrappingQuotes(getEnv("MAIL_FROM_NAME", "eBoi")),
    mailFromAddress: stripWrappingQuotes(getEnv("MAIL_FROM_ADDRESS", smtpUser)),
  };
}
