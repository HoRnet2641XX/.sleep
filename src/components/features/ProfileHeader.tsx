import type { UserProfile } from "@/types";
import { GENDER_LABELS } from "@/types";
import { Avatar } from "@/components/ui/Avatar";

type Props = {
  profile: UserProfile;
  reviewCount: number;
  totalLikes: number;
};

/** プロフィールヘッダー（アバター・名前・統計） */
export function ProfileHeader({ profile, reviewCount, totalLikes }: Props) {
  const meta = [
    profile.ageGroup,
    profile.gender ? GENDER_LABELS[profile.gender] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="space-y-5" aria-label="プロフィール概要">
      {/* アバター + 名前 */}
      <div className="flex flex-col items-center gap-3">
        <Avatar name={profile.nickname} imageUrl={profile.avatarUrl} size="lg" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-content">{profile.nickname}</h2>
          {meta && <p className="mt-1 text-sm text-content-muted">{meta}</p>}
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 overflow-hidden rounded-lg bg-surface-card">
        <div className="flex flex-col items-center gap-1 py-4">
          <span className="text-lg font-bold text-content">{reviewCount}</span>
          <span className="text-xs text-content-muted">レビュー</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-border py-4">
          <span className="text-lg font-bold text-content">{totalLikes}</span>
          <span className="text-xs text-content-muted">いいね</span>
        </div>
        <div className="flex flex-col items-center gap-1 py-4">
          <span className="text-lg font-bold text-content">—</span>
          <span className="text-xs text-content-muted">フォロワー</span>
        </div>
      </div>
    </section>
  );
}
