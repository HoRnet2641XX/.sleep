import type { UserProfile, SleepDisorderType } from "@/types";
import { SLEEP_DISORDER_LABELS } from "@/types";
import { SleepTypeBadge } from "@/components/ui/Badge";

type Props = {
  profile: UserProfile;
};

/** 睡眠情報カード */
export function SleepInfoCard({ profile }: Props) {
  const hasTypes = profile.sleepDisorderTypes.length > 0;
  const hasCause = !!profile.cause;

  if (!hasTypes && !hasCause) return null;

  return (
    <section className="card" aria-label="睡眠について">
      <h3 className="mb-4 text-sm font-semibold text-content-muted">睡眠につい���</h3>

      {/* 睡眠障害タイプ */}
      {hasTypes && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {profile.sleepDisorderTypes.map((type: SleepDisorderType) => (
              <SleepTypeBadge key={type} label={SLEEP_DISORDER_LABELS[type]} />
            ))}
          </div>
        </div>
      )}

      {/* きっかけ */}
      {hasCause && (
        <div>
          <p className="mb-1 text-xs text-content-muted">きっかけ</p>
          <p className="text-sm leading-[1.7] text-content-secondary">{profile.cause}</p>
        </div>
      )}
    </section>
  );
}
