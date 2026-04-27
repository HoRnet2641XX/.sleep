-- sleep_journals: 日々の睡眠記録
create table if not exists public.sleep_journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleep_quality smallint check (sleep_quality between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

-- ユーザーごとの時系列取得を高速化
create index if not exists idx_sleep_journals_user_created
  on public.sleep_journals(user_id, created_at desc);

-- RLS
alter table public.sleep_journals enable row level security;

-- 既存ポリシーを削除して再作成
drop policy if exists "自分の記録を参照" on public.sleep_journals;
drop policy if exists "自分の記録を作成" on public.sleep_journals;
drop policy if exists "自分の記録を削除" on public.sleep_journals;

create policy "自分の記録を参照"
  on public.sleep_journals for select
  using (auth.uid() = user_id);

create policy "自分の記録を作成"
  on public.sleep_journals for insert
  with check (auth.uid() = user_id);

create policy "自分の記録を削除"
  on public.sleep_journals for delete
  using (auth.uid() = user_id);
