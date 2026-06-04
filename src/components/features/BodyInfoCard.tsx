import type { UserProfile } from "@/types";
import { GENDER_LABELS } from "@/types";

type Props = {
  profile: UserProfile;
  isOwnProfile?: boolean;
};

/** からだの情報カード */
export function BodyInfoCard({ profile, isOwnProfile = false }: Props) {
  const weightValue = (() => {
    if (!profile.weightIsPublic) {
      if (isOwnProfile && profile.weight) return `${profile.weight} kg（非公開）`;
      if (isOwnProfile) return "未設定（非公開）";
      return "非公開";
    }

    return profile.weight ? `${profile.weight} kg` : "未設定";
  })();

  const items = [
    { label: "身長", value: profile.height ? `${profile.height} cm` : "未設定" },
    { label: "体重", value: weightValue },
    { label: "年代", value: profile.ageGroup ?? "未設定" },
    { label: "性別", value: profile.gender ? GENDER_LABELS[profile.gender] : "未設定" },
  ];

  return (
    <section className="card" aria-label="からだの情報">
      <h3 className="mb-4 text-sm font-semibold text-content-muted">からだの情報</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs text-content-muted">{item.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-content">{item.value}</dd>
          </div>
        ))}
      </div>
    </section>
  );
}
