/**
 * アフィリエイトリンク生成ユーティリティ
 *
 * Amazon / 楽天 の検索リンクを商品名+カテゴリから自動生成する。
 * アソシエイトIDは環境変数で管理（未設定時はタグなしリンクを返す）。
 */

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ?? "";
const RAKUTEN_AFF_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID ?? "";

/** Amazon 検索リンク */
export function amazonSearchUrl(productName: string): string {
  const query = encodeURIComponent(productName);
  const base = `https://www.amazon.co.jp/s?k=${query}`;
  return AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base;
}

/** 楽天市場 検索リンク */
export function rakutenSearchUrl(productName: string): string {
  const query = encodeURIComponent(productName);
  const base = `https://search.rakuten.co.jp/search/mall/${query}/`;
  return RAKUTEN_AFF_ID ? `${base}?affiliateId=${RAKUTEN_AFF_ID}` : base;
}
