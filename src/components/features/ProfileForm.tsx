"use client";

import { useState, useCallback } from "react";
import type { Gender, SleepDisorderType } from "@/types";
import { GENDER_LABELS, SLEEP_DISORDER_LABELS } from "@/types";
import { AvatarUpload } from "@/components/features/AvatarUpload";

/** フォームデータ型 */
export interface ProfileFormData {
  nickname: string;
  avatarUrl: string | null;
  height: string;
  weight: string;
  gender: Gender | null;
  ageGroup: string | null;
  sleepDisorderTypes: SleepDisorderType[];
  cause: string;
}

type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

export const EMPTY_FORM: ProfileFormData = {
  nickname: "",
  avatarUrl: null,
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
  userId: string;
  onSubmit: (data: ProfileFormData) => Promise<boolean>;
  submitLabel: string;
  submitting: boolean;
};

/** セクションカード */
function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/50 bg-surface-card p-5">
      <header className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-bold text-content">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-content-muted">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

/** プロフィールフォーム（setup / edit 共用） */
export function ProfileForm({ initialData, userId, onSubmit, submitLabel, submitting }: Props) {
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

  const toggleSleepType = useCallback((type: SleepDisorderType) => {
    setForm((prev) => {
      const types = prev.sleepDisorderTypes.includes(type)
        ? prev.sleepDisorderTypes.filter((t) => t !== type)
        : [...prev.sleepDisorderTypes, type];
      return { ...prev, sleepDisorderTypes: types };
    });
  }, []);

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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ライブプレビュー */}
      <div className="sticky top-0 z-10 -mx-5 mb-2 flex items-center gap-4 border-b border-border/50 bg-surface/90 px-5 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:border-primary/15 sm:bg-gradient-to-r sm:from-primary/5 sm:to-accent/5 sm:px-5 sm:py-4">
        {form.avatarUrl ? (
          <img
            src={form.avatarUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 text-base font-bold text-primary ring-2 ring-primary/20">
            {form.nickname.trim().charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-content-muted">プレビュー</p>
          <p className="truncate text-sm font-bold text-content">
            {form.nickname.trim() || "ニックネーム未入力"}
          </p>
          <p className="truncate text-xs text-content-secondary">
            {[form.ageGroup, form.gender && GENDER_LABELS[form.gender]].filter(Boolean).join(" · ") || "プロフィール未設定"}
          </p>
        </div>
      </div>

      {/* 基本情報 */}
      <Section
        icon={
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="基本情報"
        description="ニックネームとアイコンはコミュニティで表示されます"
      >
        <div className="mb-5">
          <AvatarUpload
            userId={userId}
            currentUrl={form.avatarUrl}
            nickname={form.nickname}
            onChange={(url) => setField("avatarUrl", url)}
          />
        </div>

        <div>
          <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium text-content">
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
      </Section>

      {/* あなたについて */}
      <Section
        icon={
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 11h6M9 15h6M9 7h6" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="5" y="3" width="14" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="あなたについて"
        description="似た属性のユーザーとマッチングするために使います（任意）"
      >
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-content-muted">年代</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="年代">
            {AGE_GROUPS.map((age) => (
              <button
                key={age}
                type="button"
                role="radio"
                aria-checked={form.ageGroup === age}
                onClick={() => setField("ageGroup", form.ageGroup === age ? null : age)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-micro ${
                  form.ageGroup === age
                    ? "border-primary bg-primary/20 text-primary-hover"
                    : "border-border text-content-secondary hover:border-border-light"
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-content-muted">性別</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="性別">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={form.gender === g}
                onClick={() => setField("gender", form.gender === g ? null : g)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-micro ${
                  form.gender === g
                    ? "border-primary bg-primary/20 text-primary-hover"
                    : "border-border text-content-secondary hover:border-border-light"
                }`}
              >
                {GENDER_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="height" className="mb-1.5 block text-xs font-medium text-content-muted">
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
            />
            {errors.height && <p className="mt-1 text-xs text-error">{errors.height}</p>}
          </div>
          <div>
            <label htmlFor="weight" className="mb-1.5 block text-xs font-medium text-content-muted">
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
            />
            {errors.weight && <p className="mt-1 text-xs text-error">{errors.weight}</p>}
          </div>
        </div>
      </Section>

      {/* 睡眠の悩み */}
      <Section
        icon={
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="睡眠の悩み"
        description="同じ悩みを持つ人のレビューを優先して届けます（複数選択可）"
      >
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
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-content-secondary hover:border-border-light"
                }`}
              >
                {SLEEP_DISORDER_LABELS[type]}
              </button>
            );
          })}
        </div>
      </Section>

      {/* きっかけ */}
      <Section
        icon={
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="きっかけ・経緯"
        description="公開範囲はあなたのプロフィールページのみ（任意）"
      >
        <textarea
          id="cause"
          rows={4}
          className="input w-full resize-none"
          placeholder="睡眠の悩みが始まったきっかけや経緯があれば..."
          value={form.cause}
          onChange={(e) => setField("cause", e.target.value)}
          maxLength={500}
        />
        <p className="mt-1 text-right text-xs text-content-muted">
          {form.cause.length} / 500
        </p>
      </Section>

      {/* 送信 */}
      <div className="sticky bottom-0 -mx-5 border-t border-border/50 bg-surface/90 px-5 py-4 backdrop-blur-xl sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0">
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              保存中...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
