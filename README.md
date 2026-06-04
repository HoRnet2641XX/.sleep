# nemuri

睡眠の悩みや眠れない夜の体験を記録・共有するためのレビューSNSです。
不眠、中途覚醒、早朝覚醒など、センシティブになりやすい体験を扱う前提で、UI、プライバシー、課金導線、運用しやすさをまとめて設計しています。

## Overview

nemuri は、睡眠に関するレビュー投稿、プロフィール、いいね、ブックマーク、フォロー、ランキング、プレミアム機能を備えた個人開発アプリです。

公開リポジトリでは、実装方針・UI・セキュリティ設計を確認できる形にしています。実運用の環境変数、サービスロールキー、Stripe secret、個人情報、DB接続情報は含めていません。

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Database / Storage
- Stripe Checkout / Webhook
- Framer Motion
- Three.js / React Three Fiber
- Capacitor
- GA4 / Plausible analytics integration

## Features

- 睡眠レビュー投稿
- 画像付きレビュー
- いいね、ブックマーク、フォロー
- プロフィール作成・編集
- 体重などの公開範囲制御
- 公開プロフィールと本人用プロフィールの分離
- プレミアム機能とStripe決済
- OAuthログイン
- アフィリエイトリンク導線
- 個人情報を送らないイベント計測

## Security And Privacy Notes

このアプリは睡眠や身体情報を扱うため、以下を重視しています。

- `profiles` と `public_profiles` を分離し、公開画面では公開用プロフィールだけを参照
- 体重の公開/非公開を `weight_is_public` で制御
- `is_premium` などの権限系カラムをクライアントから直接更新できないようDB側で保護
- Stripe Checkout / Verify / Webhook はサーバー側で検証
- Analytics にはメールアドレス、ユーザーID、レビュー本文、商品名、URL全文を送らない
- `.env`、`.env.*`、`.env*.local`、Supabase CLI temp、Vercel設定、build artifacts はGit管理から除外

## Local Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

`.env.local` には Supabase、Stripe、Analytics などの環境変数を設定してください。
公開リポジトリに secret をコミットしないでください。

## Build

```bash
npm run build
```

## Portfolio Focus

このリポジトリでは、以下の実装力を見せることを目的にしています。

- センシティブな情報を扱うSNSのUI設計
- Next.js App Routerでの画面・API実装
- Supabase RLSを前提にしたデータ分離
- Stripe決済のサーバー検証
- Tailwind CSSによるデザインシステム運用
- Framer Motion / Three.jsを使った静かなビジュアル表現
- AIやエージェント制作フローと接続しやすいコード整理
