import ProfileClient from "./ProfileClient";

/**
 * static export 用: 最低1つのパラメータを返してビルドを通す。
 * Capacitor ではクライアントサイドルーターがナビゲーションを処理するため、
 * 実際の動的IDは事前生成不要。
 */
export async function generateStaticParams() {
  return [{ id: "_" }];
}

/** プロフィール閲覧ページ */
export default function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return <ProfileClient userId={params.id} />;
}
