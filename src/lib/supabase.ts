import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseProjectRef = new URL(supabaseUrl).hostname.split(".")[0];
const authStorageKey = `sb-${supabaseProjectRef}-auth-token`;
const AUTH_EXPIRY_MARGIN_MS = 60_000;

function removeBrowserAuthStorage() {
  if (typeof window === "undefined") return;

  const keys = [
    authStorageKey,
    `${authStorageKey}-code-verifier`,
    `${authStorageKey}-user`,
  ];

  for (const key of keys) {
    window.localStorage.removeItem(key);
  }
}

function removeLegacyAuthCookies() {
  if (typeof document === "undefined") return;

  const baseCookieNames = [
    authStorageKey,
    `${authStorageKey}-code-verifier`,
    `${authStorageKey}-user`,
  ];

  for (const name of baseCookieNames) {
    for (const cookieName of [
      name,
      ...Array.from({ length: 6 }, (_, index) => `${name}.${index}`),
    ]) {
      document.cookie = `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
  }
}

function clearExpiredBrowserSession() {
  if (typeof window === "undefined") return;

  try {
    const rawSession = window.localStorage.getItem(authStorageKey);
    if (!rawSession) return;

    const session = JSON.parse(rawSession) as { expires_at?: number };
    const expiresAtMs =
      typeof session.expires_at === "number" ? session.expires_at * 1000 : 0;

    if (!expiresAtMs || expiresAtMs - Date.now() < AUTH_EXPIRY_MARGIN_MS) {
      removeBrowserAuthStorage();
    }
  } catch {
    removeBrowserAuthStorage();
  }
}

removeLegacyAuthCookies();
clearExpiredBrowserSession();

/** ブラウザ用Supabaseクライアント（Client Components向け） */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: true,
    flowType: "pkce",
    persistSession: true,
    storageKey: authStorageKey,
  },
});
