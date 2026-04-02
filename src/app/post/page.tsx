"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/features/AuthGuard";
import { CategorySelector } from "@/components/features/CategorySelector";
import { EffectSelector } from "@/components/features/EffectSelector";
import { PeriodSelector } from "@/components/features/PeriodSelector";
import { StarRating } from "@/components/ui/StarRating";
import { useReviewForm, emptyComparisonItem } from "@/hooks/useReviewForm";
import type { ReviewCategory, EffectLevel, UsagePeriod, ComparisonItem } from "@/types";

const BODY_MAX_LENGTH = 2000;

/** セクションのアニメーション設定 */
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/** トースト通知 */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-success/90 px-5 py-3 text-sm font-medium text-navy-900 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {message}
        <button type="button" onClick={onClose} className="ml-2 text-navy-900/60 hover:text-navy-900" aria-label="閉じる">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

/** 比較アイテム入力行 */
function ComparisonRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: ComparisonItem;
  index: number;
  onChange: (index: number, item: ComparisonItem) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface-card p-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-content-muted">比較 {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-xs text-content-muted hover:text-error"
          aria-label={`比較 ${index + 1} を削除`}
        >
          削除
        </button>
      </div>
      <input
        type="text"
        className="input w-full text-sm"
        placeholder="商品名・方法"
        value={item.name}
        onChange={(e) => onChange(index, { ...item, name: e.target.value })}
      />
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          className="input w-1/2 text-sm"
          placeholder="価格 (円)"
          value={item.price ?? ""}
          onChange={(e) => onChange(index, { ...item, price: e.target.value ? Number(e.target.value) : null })}
        />
        <div className="flex items-center gap-1">
          <StarRating rating={item.rating} size="sm" interactive onChange={(r) => onChange(index, { ...item, rating: r })} />
        </div>
      </div>
      <input
        type="text"
        className="input w-full text-sm"
        placeholder="ひとことメモ"
        value={item.note}
        onChange={(e) => onChange(index, { ...item, note: e.target.value })}
      />
    </motion.div>
  );
}

/** 投稿フォーム */
function PostForm() {
  const router = useRouter();
  const { form, errors, submitting, submitError, setField, validateAll, submit } = useReviewForm();
  const [toast, setToast] = useState(false);

  const handleSubmit = useCallback(async () => {
    // まずバリデーション — 不備があればエラー表示して止める
    if (!validateAll()) return;

    const success = await submit();
    if (success) {
      setToast(true);
      setTimeout(() => router.push("/"), 1500);
    }
  }, [validateAll, submit, router]);

  /** 画像URL追加 */
  const addImageUrl = useCallback(() => {
    setField("imageUrls", [...form.imageUrls, ""]);
  }, [form.imageUrls, setField]);

  const updateImageUrl = useCallback(
    (index: number, value: string) => {
      const next = [...form.imageUrls];
      next[index] = value;
      setField("imageUrls", next);
    },
    [form.imageUrls, setField],
  );

  const removeImageUrl = useCallback(
    (index: number) => {
      setField("imageUrls", form.imageUrls.filter((_, i) => i !== index));
    },
    [form.imageUrls, setField],
  );

  /** 比較アイテム操作 */
  const addComparison = useCallback(() => {
    setField("comparisonItems", [...form.comparisonItems, emptyComparisonItem()]);
  }, [form.comparisonItems, setField]);

  const updateComparison = useCallback(
    (index: number, item: ComparisonItem) => {
      const next = [...form.comparisonItems];
      next[index] = item;
      setField("comparisonItems", next);
    },
    [form.comparisonItems, setField],
  );

  const removeComparison = useCallback(
    (index: number) => {
      setField("comparisonItems", form.comparisonItems.filter((_, i) => i !== index));
    },
    [form.comparisonItems, setField],
  );

  return (
    <>
      {/* ヘッダー */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-content-secondary hover:text-content"
          >
            キャンセル
          </button>
          <h1 className="text-base font-semibold text-content">レビューを書く</h1>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            whileHover={!submitting ? { scale: 1.05 } : {}}
            whileTap={!submitting ? { scale: 0.95 } : {}}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-micro ${
              submitting
                ? "bg-navy-600 text-content-muted"
                : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {submitting ? "投稿中..." : "投稿する"}
          </motion.button>
        </div>
      </motion.header>

      {/* フォーム */}
      <main className="mx-auto max-w-content px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* カテゴリ */}
          <motion.fieldset custom={0} variants={sectionVariants} initial="hidden" animate="visible">
            <legend className="mb-2 text-sm font-medium text-content">
              カテゴリ <span className="text-error">*</span>
            </legend>
            <CategorySelector value={form.category} onChange={(cat: ReviewCategory) => setField("category", cat)} />
            {errors.category && <p className="mt-1 text-sm text-error" role="alert">{errors.category}</p>}
          </motion.fieldset>

          {/* 薬カテゴリ注意バナー */}
          <AnimatePresence>
            {form.category === "medicine" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 overflow-hidden rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3"
                role="note"
              >
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 9v4m0 4h.01M12 2L2 22h20L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-amber-300">薬に関するレビューには「個人の感想です」の注記が自動で付きます。</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 商品名 */}
          <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
            <label htmlFor="productName" className="mb-2 block text-sm font-medium text-content">
              商品名・方法 <span className="text-error">*</span>
            </label>
            <input id="productName" type="text" className="input w-full" placeholder="例: メラトニンサプリ 3mg" value={form.productName} onChange={(e) => setField("productName", e.target.value)} aria-invalid={!!errors.productName} aria-describedby={errors.productName ? "productName-error" : undefined} />
            {errors.productName && <p id="productName-error" className="mt-1 text-sm text-error" role="alert">{errors.productName}</p>}
          </motion.div>

          {/* 評価 */}
          <motion.fieldset custom={2} variants={sectionVariants} initial="hidden" animate="visible">
            <legend className="mb-2 text-sm font-medium text-content">評価 <span className="text-error">*</span></legend>
            <StarRating rating={form.rating} size="md" interactive onChange={(r: number) => setField("rating", r)} />
            {errors.rating && <p className="mt-1 text-sm text-error" role="alert">{errors.rating}</p>}
          </motion.fieldset>

          {/* 効果の実感 */}
          <motion.fieldset custom={3} variants={sectionVariants} initial="hidden" animate="visible">
            <legend className="mb-2 text-sm font-medium text-content">効果の実感 <span className="text-error">*</span></legend>
            <EffectSelector value={form.effectLevel} onChange={(l: EffectLevel) => setField("effectLevel", l)} />
            {errors.effectLevel && <p className="mt-1 text-sm text-error" role="alert">{errors.effectLevel}</p>}
          </motion.fieldset>

          {/* 使用期間 */}
          <motion.fieldset custom={4} variants={sectionVariants} initial="hidden" animate="visible">
            <legend className="mb-2 text-sm font-medium text-content">使用期間 <span className="text-error">*</span></legend>
            <PeriodSelector value={form.usagePeriod} onChange={(p: UsagePeriod) => setField("usagePeriod", p)} />
            {errors.usagePeriod && <p className="mt-1 text-sm text-error" role="alert">{errors.usagePeriod}</p>}
          </motion.fieldset>

          {/* レビュー本文 */}
          <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
            <label htmlFor="body" className="mb-2 block text-sm font-medium text-content">レビュー <span className="text-error">*</span></label>
            <textarea id="body" rows={6} maxLength={BODY_MAX_LENGTH} className="input w-full resize-none" placeholder="使ってみた感想を教えてください（10文字以上）" value={form.body} onChange={(e) => setField("body", e.target.value)} aria-invalid={!!errors.body} aria-describedby={errors.body ? "body-error" : "body-count"} />
            <div className="mt-1 flex items-center justify-between">
              {errors.body ? <p id="body-error" className="text-sm text-error" role="alert">{errors.body}</p> : <span />}
              <span id="body-count" className={`text-xs ${form.body.length > BODY_MAX_LENGTH * 0.9 ? "text-warning" : "text-content-muted"}`}>{form.body.length}/{BODY_MAX_LENGTH}</span>
            </div>
          </motion.div>

          {/* 画像URL */}
          <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-content">画像URL</span>
              <button type="button" onClick={addImageUrl} className="text-xs font-medium text-primary hover:text-primary-hover">
                + 追加
              </button>
            </div>
            <AnimatePresence>
              {form.imageUrls.map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 flex gap-2"
                >
                  <input
                    type="url"
                    className="input flex-1 text-sm"
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => updateImageUrl(i, e.target.value)}
                  />
                  <button type="button" onClick={() => removeImageUrl(i)} className="shrink-0 text-xs text-content-muted hover:text-error" aria-label="画像URLを削除">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {/* プレビュー */}
            {form.imageUrls.filter((u) => u.trim()).length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {form.imageUrls.filter((u) => u.trim()).map((url, i) => (
                  <img key={i} src={url} alt={`プレビュー ${i + 1}`} className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ))}
              </div>
            )}
          </motion.div>

          {/* 参考URL */}
          <motion.div custom={7} variants={sectionVariants} initial="hidden" animate="visible">
            <label htmlFor="referenceUrl" className="mb-2 block text-sm font-medium text-content">参考URL</label>
            <input id="referenceUrl" type="url" className="input w-full" placeholder="https://example.com/product" value={form.referenceUrl} onChange={(e) => setField("referenceUrl", e.target.value)} aria-invalid={!!errors.referenceUrl} aria-describedby={errors.referenceUrl ? "url-error" : undefined} />
            {errors.referenceUrl && <p id="url-error" className="mt-1 text-sm text-error" role="alert">{errors.referenceUrl}</p>}
          </motion.div>

          {/* 比較 */}
          <motion.div custom={8} variants={sectionVariants} initial="hidden" animate="visible">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-content">他の商品と比較</span>
              <button type="button" onClick={addComparison} className="text-xs font-medium text-primary hover:text-primary-hover">
                + 追加
              </button>
            </div>
            <AnimatePresence>
              {form.comparisonItems.map((item, i) => (
                <div key={i} className="mb-3">
                  <ComparisonRow item={item} index={i} onChange={updateComparison} onRemove={removeComparison} />
                </div>
              ))}
            </AnimatePresence>
            {form.comparisonItems.length === 0 && (
              <p className="text-xs text-content-muted">比較したい商品を追加すると、読者にとってより参考になります</p>
            )}
          </motion.div>

          {/* 送信エラー（フォーム下部） */}
          <AnimatePresence>
            {submitError && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
                role="alert"
              >
                {submitError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* 下部送信ボタン */}
          <motion.div custom={9} variants={sectionVariants} initial="hidden" animate="visible">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-micro ${
                submitting
                  ? "bg-navy-600 text-content-muted"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
            >
              {submitting ? "投稿中..." : "投稿する"}
            </button>
            {Object.keys(errors).length > 0 && (
              <p className="mt-2 text-center text-xs text-content-muted">
                未入力の項目があります。上にスクロールして確認してください。
              </p>
            )}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {toast && <Toast message="レビューを投稿しました" onClose={() => setToast(false)} />}
      </AnimatePresence>
    </>
  );
}

export default function PostPage() {
  return (
    <AuthGuard>
      <PostForm />
    </AuthGuard>
  );
}
