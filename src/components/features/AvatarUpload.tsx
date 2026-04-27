"use client";

import { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  userId: string;
  currentUrl: string | null;
  nickname: string;
  onChange: (url: string | null) => void;
};

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export function AvatarUpload({ userId, currentUrl, nickname, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選んでください");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("ファイルサイズは2MB以下にしてください");
        return;
      }

      setUploading(true);
      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/avatar-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true, cacheControl: "3600" });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
        onChange(publicData.publicUrl);
      } catch (e) {
        setError(
          e instanceof Error
            ? `アップロードに失敗しました: ${e.message}`
            : "アップロードに失敗しました",
        );
      } finally {
        setUploading(false);
      }
    },
    [userId, onChange],
  );

  const handleRemove = useCallback(() => {
    setError(null);
    onChange(null);
  }, [onChange]);

  const initial = nickname.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-5">
      {/* プレビュー */}
      <div className="relative">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="プロフィールアバター"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 text-2xl font-bold text-primary ring-2 ring-primary/20">
            {initial}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-surface/70">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* 操作 */}
      <div className="flex-1">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/25 disabled:opacity-40"
          >
            画像を選ぶ
          </button>
          {currentUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-muted transition-colors hover:border-error/40 hover:text-error disabled:opacity-40"
            >
              削除
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-content-muted">
          JPG / PNG / WebP · 2MBまで
        </p>
        {error && (
          <p className="mt-2 text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSelect(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
