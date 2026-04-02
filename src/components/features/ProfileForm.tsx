"use client";

import { useState, useCallback } from "react";
import type { Gender, SleepDisorderType } from "@/types";
import { GENDER_LABELS, SLEEP_DISORDER_LABELS } from "@/types";

/** フォームデータ型 */
export interface ProfileFormData {
  nickname: string;
  height: string;
  weight: string;
  gender: Gender | null;
  ageGroup: string | null;
  sleepDisorderTypes: SleepDisorderType[];
  cause: string;
}

/** バリデーションエラー */
type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

/** 初期値 */
export const EMPTY_FORM: ProfileFormData = {
  nickname: "",
  height: "",
  weight: "",
  gender: null,
  ageGroup: null,
  sleepDisorderTypes: [],
  cause: "",
};

const GENDERS: Gender[] = ["male", "female", "other", "prefer_not_to_say"];
const AGE_GROUPS = ["10代", "20代", "30代", "40代", "50代", "60代以上"];
const SLEEP_TYPES: SleepDisorderType[] = ["insomnia", "middle_awakening", "early_awakening", "other"];

type Props = {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<boolean>;
  submitLabel: string;
  submitting: boolean;
};

/** プロフィールフォーム（setup / edit 共用） */
export function ProfileForm({ initialData, onSubmit, submitLabel, submitting }: Props) {
  const [form, setForm] = useState<ProfileFormData>(initialData ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = useCallback(
    <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
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

  /** 睡眠障害タイプのトグル */
  const toggleSleepType = useCallback((type: SleepDisorderType) => {
    setForm((prev) => {
      const types = prev.sleepDisorderTypes.includes(type)
        ? prev.sleepDisorderTypes.filter((t) => t !== type)
        : [...prev.sleepDisorderTypes, type];
      return { ...prev, sleepDisorderTypes: types };
    });
  }, []);

  /** onBlur バリデーション */
  const handleBlur = useCallback(
    (field: keyof ProfileFormData) => {
      if (field === "nickname" && !form.nickname.trim()) {
        setErrors((prev) => ({ ...prev, nickname: "ニックネームを入力してください" }));
      }
      if (field === "height" && form.height && (isNaN(Number(form.height)) || Number(form.height) <= 0)) {
        setErrors((prev) => ({ ...prev, height: "正しい数値を入力してください" }));
      }
      if (field === "weight" && form.weight && (isNaN(Number(form.weight)) || Number(form.weight) <= 0)) {
        setErrors((prev) => ({ ...prev, weight: "正しい数値を入力してください" }));
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // バリデーション
      const newErrors: FormErrors = {};
      if (!form.nickname.trim()) newErrors.nickname = "ニックネームを入力してください";
      if (form.height && (isNaN(Number(form.height)) || Number(form.height) <= 0)) {
        newErrors.height = "正しい数値を入力してください";
      }
      if (form.weight && (isNaN(Number(form.weight)) || Number(form.weight) <= 0)) {
        newErrors.weight = "正しい数値を入力してください";
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      await onSubmit(form);
    },
    [form, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ニックネーム */}
      <div>
        <label htmlFor="nickname" className="mb-2 block text-sm font-medium text-content">
          ニックネーム <span className="text-error">*</span>
        </label>
        <input
          id="nickname"
          type="text"
          className="input w-full"
          placeholder="例: よるふくろう"
          value={form.nickname}
          onChange={(e) => setField("nickname", e.target.value)}
          onBlur={() => handleBlur("nickname")}
          aria-invalid={!!errors.nickname}
          aria-describedby={errors.nickname ? "nickname-error" : undefined}
        />
        {errors.nickname && (
          <p id="nickname-error" className="mt-1 text-sm text-error" role="alert">
            {errors.nickname}
          </p>
        )}
      </div>

      {/* 身長・体重 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="height" className="mb-2 block text-sm font-medium text-content">
            身長 (cm)
          </label>
          <input
            id="height"
            type="number"
            inputMode="numeric"
            className="input w-full"
            placeholder="170"
            value={form.height}
            onChange={(e) => setField("height", e.target.value)}
            onBlur={() => handleBlur("height")}
            aria-invalid={!!errors.height}
            aria-describedby={errors.height ? "height-error" : undefined}
          />
          {errors.height && (
            <p id="height-error" className="mt-1 text-sm text-error" role="alert">
              {errors.height}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="weight" className="mb-2 block text-sm font-medium text-content">
            体重 (kg)
          </label>
          <input
            id="weight"
            type="number"
            inputMode="numeric"
            className="input w-full"
            placeholder="65"
            value={form.weight}
            onChange={(e) => setField("weight", e.target.value)}
            onBlur={() => handleBlur("weight")}
            aria-invalid={!!errors.weight}
            aria-describedby={errors.weight ? "weight-error" : undefined}
          />
          {errors.weight && (
            <p id="weight-error" className="mt-1 text-sm text-error" role="alert">
              {errors.weight}
            </p>
          )}
        </div>
      </div>

      {/* 性別 */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-content">性別</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="性別">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={form.gender === g}
              onClick={() => setField("gender", form.gender === g ? null : g)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-micro ${
                form.gender === g
                  ? "border-primary bg-primary/20 text-primary-hover"
                  : "border-border text-content-secondary hover:border-border-light"
              }`}
            >
              {GENDER_LABELS[g]}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 年代 */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-content">年代</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="年代">
          {AGE_GROUPS.map((age) => (
            <button
              key={age}
              type="button"
              role="radio"
              aria-checked={form.ageGroup === age}
              onClick={() => setField("ageGroup", form.ageGroup === age ? null : age)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-micro ${
                form.ageGroup === age
                  ? "border-primary bg-primary/20 text-primary-hover"
                  : "border-border text-content-secondary hover:border-border-light"
              }`}
            >
              {age}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 睡眠障害タイプ（複数選択） */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-content">
          睡眠の悩み（複数選択可）
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="睡眠障害タイプ">
          {SLEEP_TYPES.map((type) => {
            const selected = form.sleepDisorderTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => toggleSleepType(type)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-micro ${
                  selected
                    ? "border-rose-400 bg-rose-500/20 text-rose-300"
                    : "border-border text-content-secondary hover:border-border-light"
                }`}
              >
                {SLEEP_DISORDER_LABELS[type]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* きっかけ */}
      <div>
        <label htmlFor="cause" className="mb-2 block text-sm font-medium text-content">
          きっかけ・経緯
        </label>
        <textarea
          id="cause"
          rows={4}
          className="input w-full resize-none"
          placeholder="睡眠の悩みが始まったきっかけや経緯があれば教えてください"
          value={form.cause}
          onChange={(e) => setField("cause", e.target.value)}
        />
      </div>

      {/* 送信ボタン */}
      <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            保存中...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
