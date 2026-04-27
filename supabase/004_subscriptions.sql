-- .nemuri プレミアムプラン: サブスクリプション管理テーブル
-- Supabase SQL Editor で手動実行してください

-- ─── サブスクリプション ───
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan text not null check (plan in ('free', 'premium')),
  status text not null default 'active' check (status in ('active', 'canceled', 'expired', 'past_due')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  payment_provider text, -- 'stripe' | 'apple' | 'google' | null(free)
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ユーザーごとに有効なサブスクリプションは1つだけ
create unique index if not exists idx_subscriptions_user_active
  on subscriptions (user_id)
  where status in ('active', 'past_due');

-- RLS
alter table subscriptions enable row level security;

-- 既存ポリシーを削除して再作成（冪等）
drop policy if exists "Users can read own subscription" on subscriptions;

-- 自分のサブスクリプションは読める
create policy "Users can read own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- サーバーサイド（service_role）からのみ INSERT/UPDATE
-- クライアントからの直接変更は禁止

-- ─── profiles にプレミアムフラグを追加（高速参照用） ───
alter table profiles add column if not exists is_premium boolean not null default false;

-- ─── ブックマーク上限管理用: フリーは20件まで ───
-- (制限はクライアントサイドで実装。DBレベルでは制限しない)
