"use client";

import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-7">
      <Link href="/" className="mb-6 inline-block text-sm text-content-muted hover:text-content">
        &larr; トップへ戻る
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-content">医療に関する免責事項</h1>
      <p className="mb-6 text-sm text-content-muted">最終更新日: 2026年4月20日</p>

      <div className="space-y-6 text-base leading-relaxed text-content-secondary">
        <section className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-5">
          <h2 className="mb-3 text-xl font-bold text-amber-400">重要なお知らせ</h2>
          <p className="text-content">
            .nemuri は、睡眠に関する悩みを持つ方同士が体験を共有するコミュニティです。
            <strong>医療機関ではなく、医療アドバイスを提供するサービスではありません。</strong>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">本サービスの位置づけ</h2>
          <ul className="ml-5 list-disc space-y-2">
            <li>本サービスに掲載される情報は、すべてユーザー個人の体験に基づくものです</li>
            <li>投稿内容は医学的な診断、治療法の推奨、または処方箋の代替として利用することを意図していません</li>
            <li>同じ症状でも、適切な対処法は個人によって異なります。ある人に効果があった方法が、別の人に効果があるとは限りません</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">医療機関への相談を推奨する場合</h2>
          <p>以下のような場合は、本サービスの利用の有無にかかわらず、速やかに医療機関にご相談ください。</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>睡眠の問題が日常生活に深刻な影響を与えている場合</li>
            <li>処方薬の変更・中止を検討している場合</li>
            <li>強い不安感、抑うつ感、希死念慮がある場合</li>
            <li>いびき・無呼吸など、睡眠時無呼吸症候群が疑われる場合</li>
            <li>サプリメントや市販薬と処方薬の併用を考えている場合</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">投稿に関するガイドライン</h2>
          <p>投稿者は以下の点を理解したうえで投稿してください。</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>あなたの体験は、あくまで個人の体験です。「これで治る」「絶対に効く」などの断定的な表現は控えてください</li>
            <li>処方薬に関する投稿では、具体的な用量や服用方法の指示は控えてください</li>
            <li>「私の場合は〜」「個人的には〜」など、個人の体験であることが分かる書き方を心がけてください</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">運営者の責任範囲</h2>
          <ul className="ml-5 list-disc space-y-2">
            <li>運営者は投稿内容の医学的正確性を審査・保証しません</li>
            <li>本サービスの情報に基づいて行われた行動の結果について、運営者は責任を負いません</li>
            <li>明らかに危険な情報（用量を大幅に超える使用法の推奨等）は、通報に基づき削除する場合があります</li>
          </ul>
        </section>

        <section className="rounded-lg border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-3 text-xl font-bold text-content">相談窓口</h2>
          <p className="mb-3">睡眠や心の問題でつらいときは、以下の相談窓口を利用してください。</p>
          <ul className="space-y-2">
            <li>
              <strong>よりそいホットライン</strong>: 0120-279-338（24時間対応）
            </li>
            <li>
              <strong>こころの健康相談統一ダイヤル</strong>: 0570-064-556
            </li>
            <li>
              <strong>いのちの電話</strong>: 0120-783-556
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
