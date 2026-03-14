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

export function getAppConfig() {
  return {
    appBaseUrl: getEnv("APP_BASE_URL", "https://boi-bazar-bd.lovable.app"),
    supabaseUrl: requireEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getPaymentConfig() {
  return {
    paystationMerchantId: requireEnv("PAYSTATION_MERCHANT_ID"),
    paystationPassword: requireEnv("PAYSTATION_PASSWORD"),
  };
}

export function getEmailConfig() {
  return {
    resendApiKey: requireEnv("RESEND_API_KEY"),
    resendFromEmail: getEnv("RESEND_FROM_EMAIL", "noreply@socialgeekbd.com"),
  };
}
