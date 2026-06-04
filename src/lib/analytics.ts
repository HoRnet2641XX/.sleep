export type AnalyticsPrimitive = string | number | boolean;
export type AnalyticsProps = Record<string, AnalyticsPrimitive | null | undefined>;

export type AnalyticsEventName =
  | "affiliate_click"
  | "bookmark_click"
  | "home_screen_section_view"
  | "like_click"
  | "login_click"
  | "login_complete"
  | "oauth_click"
  | "oauth_start"
  | "premium_checkout_start"
  | "review_start"
  | "review_submit"
  | "share_click"
  | "signup_click"
  | "signup_complete";

export type OAuthIntent = "login" | "signup";

export type StoredOAuthIntent = {
  provider: string;
  intent: OAuthIntent;
};

type PlausibleOptions = {
  props?: Record<string, AnalyticsPrimitive>;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: PlausibleOptions) => void;
  }
}

type SearchParamsLike = {
  forEach(callback: (value: string, key: string) => void): void;
};

const SAFE_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
]);

const OAUTH_INTENT_STORAGE_KEY = "nemuri.oauth_intent";

function truncate(value: string): string {
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

export function buildAnalyticsPath(
  pathname: string,
  searchParams?: SearchParamsLike | null,
): string {
  if (!searchParams) return pathname;

  const safeParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (SAFE_QUERY_PARAMS.has(key)) {
      safeParams.set(key, value);
    }
  });

  const query = safeParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function currentPagePath(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return buildAnalyticsPath(window.location.pathname, new URLSearchParams(window.location.search));
}

function sanitizeProps(props: AnalyticsProps): Record<string, AnalyticsPrimitive> {
  const cleaned: Record<string, AnalyticsPrimitive> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (typeof value === "string") {
      cleaned[key] = truncate(value);
      return;
    }

    cleaned[key] = value;
  });

  const pagePath = currentPagePath();
  if (pagePath) cleaned.page_path = pagePath;

  return cleaned;
}

export function trackEvent(name: AnalyticsEventName, props: AnalyticsProps = {}) {
  if (typeof window === "undefined") return;

  const payload = sanitizeProps(props);

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
    }

    if (typeof window.plausible === "function") {
      window.plausible(name, { props: payload });
    }

    if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") {
      // Debug logging is opt-in to keep production consoles quiet.
      // eslint-disable-next-line no-console
      console.info("[analytics]", name, payload);
    }
  } catch {
    // Analytics must never block the app experience.
  }
}

export function rememberOAuthIntent(provider: string, intent: OAuthIntent) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      OAUTH_INTENT_STORAGE_KEY,
      JSON.stringify({ provider, intent }),
    );
  } catch {
    // OAuth should continue even when storage is unavailable.
  }
}

export function consumeOAuthIntent(): StoredOAuthIntent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(OAUTH_INTENT_STORAGE_KEY);
    window.sessionStorage.removeItem(OAUTH_INTENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredOAuthIntent>;
    if (!parsed.provider || !parsed.intent) return null;
    if (parsed.intent !== "login" && parsed.intent !== "signup") return null;

    return {
      provider: parsed.provider,
      intent: parsed.intent,
    };
  } catch {
    return null;
  }
}
