import ReviewDetailClient from "./ReviewDetailClient";

/**
 * static export 用: 最低1つのパラメータを返してビルドを通す。
 * Capacitor ではクライアントサイドルーターがナビゲーションを処理するため、
 * 実際の動的IDは事前生成不要。
 */
export async function generateStaticParams() {
  return [{ id: "_" }];
}

/** レビュー詳細ページ */
export default function ReviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ReviewDetailClient reviewId={params.id} />;
}
