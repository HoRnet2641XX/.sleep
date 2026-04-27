"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Category = "general" | "bug" | "report" | "deletion" | "other";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "general", label: "一般的なお問い合わせ" },
  { value: "bug", label: "不具合の報告" },
  { value: "report", label: "不適切なコンテンツの通報" },
  { value: "deletion", label: "アカウント・データ削除の依頼" },
  { value: "other", label: "その他" },
];

export default function ContactPage() {
  const [category, setCategory] = useState<Category>("general");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const subject =
      CATEGORIES.find((c) => c.value === category)?.label ?? "お問い合わせ";

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        user_id: user?.id ?? null,
        email,
        category,
        subject,
        body: message,
      });

    if (insertError) {
      setError(`送信に失敗しました: ${insertError.message}`);
      setSending(false);
      return;
    }

    setSubmitted(true);
    setSending(false);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-content px-4 py-7">
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="h-8 w-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-content">送信しました</h2>
          <p className="mb-6 text-content-secondary">
            お問い合わせありがとうございます。<br />
            内容を確認のうえ、通常3営業日以内にご連絡いたします。
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-primary px-5 py-3 text-sm font-bold text-surface hover:bg-primary-hover"
          >
            トップへ戻る
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-4 py-7">
      <Link href="/" className="mb-6 inline-block text-sm text-content-muted hover:text-content">
        &larr; トップへ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-content">お問い合わせ</h1>
      <p className="mb-6 text-content-secondary">
        ご質問、不具合報告、コンテンツの通報など、お気軽にご連絡ください。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-bold text-content">
            カテゴリ
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-border bg-surface-input px-4 py-3 text-content outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-content">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-border bg-surface-input px-4 py-3 text-content outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-bold text-content">
            お問い合わせ内容
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="できるだけ詳しくお書きください"
            className="w-full resize-y rounded-lg border border-border bg-surface-input px-4 py-3 text-content outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {category === "deletion" && (
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-content-secondary">
            アカウント削除をご希望の場合、登録時のメールアドレスをご記入ください。
            本人確認後、30日以内にすべてのデータを削除します。
          </div>
        )}

        {error && (
          <p className="mb-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-lg bg-primary px-5 py-3 font-bold text-surface hover:bg-primary-hover disabled:opacity-50"
        >
          {sending ? "送信中..." : "送信する"}
        </button>
      </form>
    </div>
  );
}
