"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type {
  ReviewFormData,
  ReviewCategory,
  EffectLevel,
  UsagePeriod,
  ComparisonItem,
} from "@/types";

/** バリデーションエラーの型 */
type FormErrors = Partial<Record<keyof ReviewFormData, string>>;

/** 初期値 */
const INITIAL_FORM: ReviewFormData = {
  category: "",
  productName: "",
  rating: 0,
  effectLevel: "",
  usagePeriod: "",
  body: "",
  images: [],
  imageUrls: [],
  referenceUrl: "",
  comparisonItems: [],
  isPrivate: false,
};

/** バリデーション */
function validate(form: ReviewFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.category) errors.category = "カテゴリを選択してください";
  if (!form.productName.trim()) errors.productName = "商品名を入力してください";
  if (form.rating === 0) errors.rating = "評価を選択してください";
  if (!form.effectLevel) errors.effectLevel = "効果の実感を選択してください";
  if (!form.usagePeriod) errors.usagePeriod = "使用期間を選択してください";
  if (!form.body.trim()) {
    errors.body = "レビューを入力してください";
  } else if (form.body.trim().length < 10) {
    errors.body = "レビューは10文字以上で入力してください";
  }
  if (form.referenceUrl && !/^https?:\/\/.+/.test(form.referenceUrl)) {
    errors.referenceUrl = "正しいURLを入力してください";
  }

  return errors;
}

/** フォームが送信可能かを判定 */
function isValid(form: ReviewFormData): boolean {
  return Object.keys(validate(form)).length === 0;
}

/** 空の比較アイテム */
export function emptyComparisonItem(): ComparisonItem {
  return { name: "", price: null, rating: 3, note: "" };
}

/** レビュー投稿フォームのカスタムフック */
export function useReviewForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<ReviewFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** フィールド更新 */
  const setField = useCallback(
    <K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  /** バリデーション実行 */
  const validateAll = useCallback((): boolean => {
    const result = validate(form);
    setErrors(result);
    return Object.keys(result).length === 0;
  }, [form]);

  /** 投稿送信 */
  const submit = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setSubmitError("ログインが必要です");
      return false;
    }

    const result = validate(form);
    setErrors(result);
    if (Object.keys(result).length > 0) return false;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 有効な画像URLのみフィルタ
      const validImageUrls = form.imageUrls.filter((url) => url.trim().length > 0);

      // 有効な比較アイテムのみフィルタ
      const validComparisons = form.comparisonItems.filter((item) => item.name.trim().length > 0);

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        category: form.category as ReviewCategory,
        product_name: form.productName,
        rating: form.rating,
        effect_level: form.effectLevel as EffectLevel,
        usage_period: form.usagePeriod as UsagePeriod,
        body: form.body,
        image_urls: validImageUrls,
        reference_url: form.referenceUrl.trim() || null,
        comparison_items: validComparisons.length > 0 ? validComparisons : [],
        is_private: form.isPrivate,
      });

      if (error) throw error;

      setForm(INITIAL_FORM);
      setErrors({});
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      const message = e?.message || "不明なエラー";
      setSubmitError(`投稿に失敗しました: ${message}`);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [form, user]);

  return {
    form,
    errors,
    submitting,
    submitError,
    canSubmit: isValid(form),
    setField,
    validateAll,
    submit,
  };
}
