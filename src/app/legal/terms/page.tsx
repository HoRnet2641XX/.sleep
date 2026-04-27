"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-7">
      <Link href="/" className="mb-6 inline-block text-sm text-content-muted hover:text-content">
        &larr; トップへ戻る
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-content">利用規約</h1>
      <p className="mb-6 text-sm text-content-muted">最終更新日: 2026年4月20日</p>

      <div className="space-y-6 text-base leading-relaxed text-content-secondary">
        <section>
          <h2 className="mb-3 text-xl font-bold text-content">1. サービスの概要</h2>
          <p>
            .nemuri（以下「本サービス」）は、睡眠に関する悩みを抱える方同士が、
            自分に合った対処法やアイテムのレビューを共有するためのプラットフォームです。
            本規約は、本サービスのすべての利用者に適用されます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">2. 利用条件・年齢制限</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>本サービスは<strong>18歳以上</strong>の方を対象としています</li>
            <li>18歳未満の方は、保護者の同意を得たうえでご利用ください</li>
            <li>アカウント登録には、有効なメールアドレスが必要です</li>
            <li>1人につき1つのアカウントのみ作成できます</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">3. ユーザーの責任</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>投稿内容はユーザー自身の責任のもとで行ってください</li>
            <li>アカウントの管理（パスワード等）はユーザー自身の責任です</li>
            <li>他のユーザーに対して敬意を持って接してください</li>
            <li>投稿内容は個人の体験に基づくものであり、医療アドバイスではないことを理解したうえでご利用ください</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">4. 禁止事項</h2>
          <p>以下の行為は禁止します。</p>
          <ul className="ml-5 list-disc space-y-2">
            <li><strong>医療行為に該当する助言</strong>: 特定の薬の用量変更、処方薬の推奨、診断に相当する発言</li>
            <li><strong>虚偽の情報</strong>: 使用していない製品のレビュー、捏造された体験談の投稿</li>
            <li><strong>誹謗中傷・ハラスメント</strong>: 他のユーザーへの攻撃的な発言、差別的な表現</li>
            <li><strong>スパム・宣伝行為</strong>: 無関係な広告、アフィリエイトリンクの投稿、マルチ商法の勧誘</li>
            <li><strong>個人情報の暴露</strong>: 他のユーザーの個人情報を本人の同意なく公開する行為</li>
            <li><strong>著作権侵害</strong>: 他者の著作物を無断で転載する行為</li>
            <li><strong>不正アクセス</strong>: システムへの不正なアクセス、データの改ざん</li>
            <li><strong>自殺・自傷の助長</strong>: 自殺や自傷行為を推奨・助長する発言</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">5. 通報・ブロック</h2>
          <h3 className="mb-2 text-lg font-bold text-content">5.1 通報</h3>
          <ul className="ml-5 list-disc space-y-1">
            <li>禁止事項に該当する投稿やユーザーを見つけた場合、通報機能で報告できます</li>
            <li>通報は匿名で処理されます。通報者の情報が相手に開示されることはありません</li>
            <li>通報を受けた投稿は、運営チームが確認し、必要に応じて削除・非表示の措置を取ります</li>
            <li>通報への対応は通常48時間以内に行いますが、状況によって前後する場合があります</li>
          </ul>
          <h3 className="mb-2 mt-4 text-lg font-bold text-content">5.2 ブロック</h3>
          <ul className="ml-5 list-disc space-y-1">
            <li>特定のユーザーをブロックすることで、そのユーザーからのコンテンツを非表示にできます</li>
            <li>ブロックされたユーザーには、ブロックされたことは通知されません</li>
            <li>ブロックはいつでも解除できます</li>
          </ul>
          <h3 className="mb-2 mt-4 text-lg font-bold text-content">5.3 違反時の措置</h3>
          <p>禁止事項への違反が確認された場合、運営は以下の措置を取ることがあります。</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>該当コンテンツの削除</li>
            <li>警告の送信</li>
            <li>一時的なアカウント停止（7日間〜30日間）</li>
            <li>重大または繰り返しの違反の場合、アカウントの永久停止</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">6. 退会・データ削除</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>ユーザーはいつでも自由にアカウントを削除（退会）できます</li>
            <li>退会は設定画面の「アカウント削除」から実行できます</li>
            <li>退会後、以下のデータは<strong>30日以内</strong>に完全に削除されます:
              <ul className="ml-5 mt-1 list-disc space-y-1">
                <li>プロフィール情報（ユーザー名、アイコン、自己紹介等）</li>
                <li>メールアドレス、認証情報</li>
                <li>睡眠に関する自己申告データ</li>
              </ul>
            </li>
            <li>投稿済みのレビュー・コメントは、投稿者名を「退会済みユーザー」として匿名化したうえで、コミュニティの参考情報として残る場合があります。退会前にすべての投稿を個別に削除することも可能です</li>
            <li>退会後に同じメールアドレスで再登録した場合、以前のデータを復元することはできません</li>
            <li>法令により保持が義務付けられるデータ（アクセスログ等）は、法定期間の満了後に削除します</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">7. 知的財産権</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>本サービスのデザイン、ロゴ、ソフトウェア等の知的財産権は運営者に帰属します</li>
            <li>ユーザーが投稿したコンテンツの著作権はユーザーに帰属しますが、本サービス内での表示・共有のために必要な範囲でのライセンスを運営者に付与するものとします</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">8. 免責事項</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>本サービス上の情報は、ユーザー個人の体験に基づくものであり、医学的な正確性を保証するものではありません</li>
            <li>本サービスの利用に起因する損害について、運営者は法令上許容される範囲で責任を負いません</li>
            <li>サービスの中断・停止・変更について、事前の通知なく行う場合があります</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">9. 規約の変更</h2>
          <p>
            本規約は必要に応じて変更されることがあります。
            重要な変更がある場合は、本サービス上で事前に通知します。
            変更後も継続して本サービスを利用した場合、変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">10. 準拠法・管轄</h2>
          <p>
            本規約は日本法に準拠し、日本法に基づいて解釈されるものとします。
            本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">11. お問い合わせ</h2>
          <p>
            本規約に関するお問い合わせは、
            <Link href="/contact" className="text-primary hover:text-primary-hover underline">
              お問い合わせページ
            </Link>
            よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}
