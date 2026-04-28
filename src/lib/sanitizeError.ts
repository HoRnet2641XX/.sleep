/**
 * Supabase / 外部 API のエラーをユーザー向けに変換する。
 * 内部情報（カラム名・スタックトレース等）の漏洩を防ぐ。
 *
 * 開発時は元メッセージを console に出すが、UI では汎用文を返す。
 */

export type SafeError = {
  /** ユーザーに表示する汎用メッセージ */
  message: string;
  /** 内部用コード（ログに残す） */
  code?: string;
};

const FRIENDLY_MAP: Record<string, string> = {
  // PostgREST / Postgres
  PGRST116: "対象が見つかりませんでした",
  PGRST204: "システム設定の更新が必要です（管理者にお問い合わせください）",
  "23505": "既に登録されています",
  "23503": "関連データが見つかりません",
  "23514": "入力内容に問題があります",
  "42P10": "操作が多すぎます。少し時間をおいてからお試しください",
  // Supabase Auth
  invalid_grant: "メールアドレスまたはパスワードが正しくありません",
  email_address_invalid: "メールアドレスの形式が正しくありません",
  weak_password: "パスワードが脆弱です",
  // Storage
  payload_too_large: "ファイルサイズが大きすぎます",
};

const FALLBACK = "処理に失敗しました。時間をおいてもう一度お試しください";

export function sanitizeError(err: unknown): SafeError {
  if (process.env.NODE_ENV !== "production") {
    console.error("[sanitizeError]", err);
  }

  if (!err || typeof err !== "object") {
    return { message: FALLBACK };
  }
  const e = err as { code?: string; message?: string; status?: number };
  const code = e.code ?? (e.status ? String(e.status) : undefined);
  if (code && FRIENDLY_MAP[code]) {
    return { message: FRIENDLY_MAP[code], code };
  }
  /* メッセージから既知パターンを抽出 */
  const msg = e.message ?? "";
  if (/duplicate key/i.test(msg)) return { message: "既に登録されています", code };
  if (/violates check constraint/i.test(msg))
    return { message: "入力内容に問題があります", code };
  if (/Rate limit/i.test(msg))
    return { message: "操作が多すぎます。少し時間をおいてからお試しください", code };
  if (/permission denied|RLS|row-level security/i.test(msg))
    return { message: "この操作を行う権限がありません", code };

  return { message: FALLBACK, code };
}
