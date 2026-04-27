"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";

type ProfileBrief = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
};

type Tab = "followers" | "following";

export default function FollowsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = params?.id ?? "";
  const initialTab = (searchParams.get("tab") as Tab) ?? "followers";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [followers, setFollowers] = useState<ProfileBrief[]>([]);
  const [following, setFollowing] = useState<ProfileBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from("follows")
          .select("follower_id, profiles!follows_follower_id_fkey(id, nickname, avatar_url)")
          .eq("following_id", userId),
        supabase
          .from("follows")
          .select("following_id, profiles!follows_following_id_fkey(id, nickname, avatar_url)")
          .eq("follower_id", userId),
      ]);
      if (cancelled) return;

      const mapBrief = (p: unknown): ProfileBrief | null => {
        if (!p || typeof p !== "object") return null;
        const r = p as Record<string, unknown>;
        return {
          id: r.id as string,
          nickname: (r.nickname as string) ?? "ユーザー",
          avatarUrl: (r.avatar_url as string | null) ?? null,
        };
      };

      const fws =
        (followersRes.data ?? [])
          .map((row) => mapBrief(row.profiles))
          .filter(Boolean) as ProfileBrief[];
      const fos =
        (followingRes.data ?? [])
          .map((row) => mapBrief(row.profiles))
          .filter(Boolean) as ProfileBrief[];

      setFollowers(fws);
      setFollowing(fos);
      setCounts({ followers: fws.length, following: fos.length });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const list = tab === "followers" ? followers : following;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto max-w-content px-4 py-3">
          <div className="mb-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center text-content-secondary hover:text-content"
              aria-label="前のページに戻る"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-content">つながり</h1>
          </div>

          {/* タブ */}
          <div role="tablist" aria-label="フォロー切替" className="flex gap-4 pl-1">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "followers"}
              onClick={() => setTab("followers")}
              className={`min-h-[32px] border-b-2 pb-1 text-sm transition-colors ${
                tab === "followers"
                  ? "border-primary font-semibold text-content"
                  : "border-transparent text-content-muted"
              }`}
            >
              フォロワー <span className="ml-0.5 text-xs">{counts.followers}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "following"}
              onClick={() => setTab("following")}
              className={`min-h-[32px] border-b-2 pb-1 text-sm transition-colors ${
                tab === "following"
                  ? "border-primary font-semibold text-content"
                  : "border-transparent text-content-muted"
              }`}
            >
              フォロー中 <span className="ml-0.5 text-xs">{counts.following}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 pb-24 pt-5">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-card" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="py-12 text-center text-sm text-content-muted">
            {tab === "followers" ? "フォロワーはまだいません" : "フォロー中のユーザーはいません"}
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {list.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/profile/${p.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-elevated/30"
                >
                  <Avatar name={p.nickname} imageUrl={p.avatarUrl} />
                  <span className="text-sm font-medium text-content">{p.nickname}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
