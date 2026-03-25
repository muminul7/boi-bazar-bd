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

export function getAppConfig() {
  return {
    appBaseUrl: getEnv("APP_BASE_URL", "https://boi-bazar-bd.lovable.app"),
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
  return {
    resendApiKey: requireEnv("RESEND_API_KEY"),
    resendFromEmail: getEnv("RESEND_FROM_EMAIL", "noreply@socialgeekbd.com"),
  };
}
