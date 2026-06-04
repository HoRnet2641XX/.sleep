# .nemuri Event Tracking

個人を特定できる情報やレビュー本文は送らず、導線改善に必要な最小限の状態だけを送る。
実装は `src/lib/analytics.ts` の `trackEvent` に集約し、GA4 と Plausible の両方へ同じイベント名で送信する。

## Environment

| Variable                       | Purpose                                      |
| ------------------------------ | -------------------------------------------- |
| `NEXT_PUBLIC_GA_ID`            | Google Analytics 4 measurement ID            |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible Analytics domain                   |
| `NEXT_PUBLIC_ANALYTICS_DEBUG`  | `true` の時だけ console にイベント内容を出す |

## Events

| Event                      | When                                        | Props                                                                                  |
| -------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `signup_click`             | LP CTA または新規登録フォーム送信時         | `location`, `method`                                                                   |
| `signup_complete`          | メール登録成功時、または OAuth 初回登録成功時 | `method`, `next`                                                                       |
| `login_click`              | LP ログイン導線またはログインフォーム送信時 | `location`, `method`                                                                   |
| `login_complete`           | メール / OAuth ログイン成功時               | `method`, `next`                                                                       |
| `oauth_click`              | Google / X の OAuth ボタン押下時            | `provider`, `intent`, `location`                                                       |
| `oauth_start`              | OAuth リダイレクト開始時                    | `provider`, `intent`                                                                   |
| `review_start`             | 投稿ページを開いた時                        | `location`                                                                             |
| `review_submit`            | レビュー投稿成功時                          | `category`, `rating`, `is_private`, `has_reference`, `image_count`, `comparison_count` |
| `like_click`               | いいね追加/解除が成功した時                 | `action`, `location`                                                                   |
| `bookmark_click`           | ブックマーク追加/解除が成功した時           | `action`, `location`                                                                   |
| `affiliate_click`          | Amazon / 楽天の広告リンク押下時             | `provider`, `category`, `location`                                                     |
| `share_click`              | X / LINE / URLコピーの共有操作時            | `channel`, `location`                                                                  |
| `premium_checkout_start`   | Stripe Checkout 開始時                      | `plan`, `price`, `location`                                                            |
| `home_screen_section_view` | LP のホーム画面追加セクション表示時         | `location`                                                                             |

## Privacy Notes

- メールアドレス、ユーザーID、レビュー本文、商品名、URL全文は送信しない。
- `page_path` は自動付与するが、許可済み query (`utm_*`, `ref`) 以外は落とす。
- 決済戻り URL の `session_id` や認証系 token は analytics に送らない。
