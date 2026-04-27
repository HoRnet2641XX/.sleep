"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-7">
      <Link href="/" className="mb-6 inline-block text-sm text-content-muted hover:text-content">
        &larr; トップへ戻る
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-content">プライバシーポリシー</h1>
      <p className="mb-6 text-sm text-content-muted">最終更新日: 2026年4月20日</p>

      <div className="space-y-6 text-base leading-relaxed text-content-secondary">
        <section>
          <h2 className="mb-3 text-xl font-bold text-content">1. はじめに</h2>
          <p>
            .nemuri（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
            本ポリシーでは、本サービスが収集する情報、その利用方法、およびユーザーの権利について説明します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">2. 収集する情報</h2>
          <h3 className="mb-2 text-lg font-bold text-content">2.1 ユーザーが提供する情報</h3>
          <ul className="ml-5 list-disc space-y-1">
            <li>アカウント登録情報（メールアドレス、ユーザー名、プロフィール情報）</li>
            <li>投稿コンテンツ（レビュー、コメント、評価）</li>
            <li>睡眠に関する自己申告情報（睡眠障害の種類、睡眠時間等）</li>
            <li>お問い合わせ内容</li>
          </ul>
          <h3 className="mb-2 mt-4 text-lg font-bold text-content">2.2 自動的に収集する情報</h3>
          <ul className="ml-5 list-disc space-y-1">
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
            <li>Cookie および類似技術によるデータ</li>
            <li>デバイス情報（OS、画面サイズ）</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">3. 情報の利用目的</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>本サービスの提供・維持・改善</li>
            <li>ユーザーサポートへの対応</li>
            <li>利用傾向の分析およびサービス改善</li>
            <li>不正利用の検知・防止</li>
            <li>重要な通知やお知らせの送信</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">4. 情報の第三者提供</h2>
          <p>本サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく開示が必要な場合</li>
            <li>人の生命、身体または財産の保護に必要な場合</li>
            <li>サービス提供に必要な業務委託先（データ保管、分析等）への共有。ただし、委託先に対しても適切な管理を求めます</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">5. 情報の保管</h2>
          <p>
            ユーザーの情報は、Supabase（クラウドデータベース）上で暗号化して保管します。
            アカウント削除後、個人情報は30日以内にすべて削除されます。
            匿名化された統計データは、サービス改善のために保持する場合があります。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">6. ユーザーの権利</h2>
          <p>ユーザーは以下の権利を有します。</p>
          <ul className="ml-5 list-disc space-y-1">
            <li><strong>アクセス権</strong>: 自身の個人情報の開示を求めることができます</li>
            <li><strong>訂正権</strong>: プロフィール設定から自身の情報を修正できます</li>
            <li><strong>削除権</strong>: アカウント削除により全データの削除を求めることができます</li>
            <li><strong>異議権</strong>: データの取り扱いについて異議を申し立てることができます</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">7. Cookie の利用</h2>
          <p>
            本サービスでは、セッション管理およびユーザー体験の向上のために Cookie を使用します。
            ブラウザの設定により Cookie を無効にすることもできますが、一部の機能が利用できなくなる場合があります。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">8. 未成年者のプライバシー</h2>
          <p>
            本サービスは18歳以上の方を対象としています。
            18歳未満の方は、保護者の同意のもとでご利用ください。
            18歳未満と判明した場合、当該アカウントの情報は速やかに削除します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">9. ポリシーの変更</h2>
          <p>
            本ポリシーは必要に応じて変更されることがあります。
            重要な変更がある場合は、本サービス上で通知します。
            変更後の本ポリシーは、本ページに掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-content">10. お問い合わせ</h2>
          <p>
            プライバシーに関するお問い合わせは、
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
