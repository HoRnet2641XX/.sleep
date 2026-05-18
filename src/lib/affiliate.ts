/**
 * アフィリエイトリンク生成ユーティリティ
 *
 * Amazon / 楽天 の検索リンクを商品名+カテゴリから自動生成する。
 * IDは環境変数で管理し、未設定の広告リンクは表示側で除外できるようにする。
 */

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ?? "";
const RAKUTEN_AFF_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID ?? "";
const RAKUTEN_URL_TEMPLATE = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_URL_TEMPLATE ?? "";

export type AffiliateProvider = "rakuten" | "amazon";

export type AffiliateLink = {
  provider: AffiliateProvider;
  label: string;
  href: string;
  configured: boolean;
};

function buildRakutenSearchUrl(searchTerm: string): string {
  const query = encodeURIComponent(searchTerm);
  return `https://search.rakuten.co.jp/search/mall/${query}/`;
}

function applyRakutenTemplate(template: string, destination: string, searchTerm: string): string {
  const encodedDestination = encodeURIComponent(destination);
  const encodedQuery = encodeURIComponent(searchTerm);

  return template
    .replaceAll("{url}", destination)
    .replaceAll("{encodedUrl}", encodedDestination)
    .replaceAll("{query}", searchTerm)
    .replaceAll("{encodedQuery}", encodedQuery);
}

function normalizeRakutenAffiliateId(id: string): string {
  return id
    .replace(/^https:\/\/hb\.afl\.rakuten\.co\.jp\/(?:ichiba|hgc)\//, "")
    .replace(/\/?\?.*$/, "")
    .replace(/\/$/, "");
}

/** Amazon 検索リンク */
export function amazonSearchUrl(productName: string): string {
  const query = encodeURIComponent(productName);
  const base = `https://www.amazon.co.jp/s?k=${query}`;
  return AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base;
}

/** 楽天市場 検索リンク */
export function rakutenSearchUrl(productName: string): string {
  const destination = buildRakutenSearchUrl(productName);

  if (RAKUTEN_URL_TEMPLATE) {
    return applyRakutenTemplate(RAKUTEN_URL_TEMPLATE, destination, productName);
  }

  if (!RAKUTEN_AFF_ID) return destination;

  const affiliateId = normalizeRakutenAffiliateId(RAKUTEN_AFF_ID);
  const encodedDestination = encodeURIComponent(destination);

  return `https://hb.afl.rakuten.co.jp/ichiba/${affiliateId}/?pc=${encodedDestination}&link_type=text`;
}

export function configuredAffiliateLinks(searchTerm: string): AffiliateLink[] {
  const links: AffiliateLink[] = [];

  if (RAKUTEN_AFF_ID || RAKUTEN_URL_TEMPLATE) {
    links.push({
      provider: "rakuten",
      label: "楽天市場",
      href: rakutenSearchUrl(searchTerm),
      configured: true,
    });
  }

  if (AMAZON_TAG) {
    links.push({
      provider: "amazon",
      label: "Amazon",
      href: amazonSearchUrl(searchTerm),
      configured: true,
    });
  }

  return links;
}
