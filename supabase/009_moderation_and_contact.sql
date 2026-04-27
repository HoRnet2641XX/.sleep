-- ─── 通報 ───────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('review', 'comment', 'user')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 5 and 1000),
  status text not null default 'pending' check (status in ('pending','reviewing','resolved','dismissed')),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_status_created on public.reports(status, created_at desc);
create index if not exists idx_reports_target on public.reports(target_type, target_id);

alter table public.reports enable row level security;

drop policy if exists "通報は本人のみ作成" on public.reports;
drop policy if exists "通報は本人のみ参照" on public.reports;

create policy "通報は本人のみ作成"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "通報は本人のみ参照"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- ─── ブロック ───────────────────────────────────────────
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists idx_blocks_blocker on public.blocks(blocker_id);

alter table public.blocks enable row level security;

drop policy if exists "ブロックは本人のみ参照" on public.blocks;
drop policy if exists "ブロックは本人のみ作成" on public.blocks;
drop policy if exists "ブロックは本人のみ削除" on public.blocks;

create policy "ブロックは本人のみ参照"
  on public.blocks for select
  using (auth.uid() = blocker_id);

create policy "ブロックは本人のみ作成"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "ブロックは本人のみ削除"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

-- ─── お問い合わせ ───────────────────────────────────────────
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  category text not null check (category in ('general','bug','report','deletion','other')),
  subject text not null,
  body text not null,
  status text not null default 'open' check (status in ('open','responded','closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_status on public.contact_messages(status, created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "お問い合わせは誰でも作成" on public.contact_messages;
drop policy if exists "お問い合わせは本人のみ参照" on public.contact_messages;

create policy "お問い合わせは誰でも作成"
  on public.contact_messages for insert
  with check (true);

create policy "お問い合わせは本人のみ参照"
  on public.contact_messages for select
  using (auth.uid() = user_id);

-- ─── 通知 ───────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('like','comment','follow','match','system')),
  target_type text check (target_type in ('review','comment','user')),
  target_id uuid,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "通知は本人のみ参照" on public.notifications;
drop policy if exists "通知は本人のみ更新" on public.notifications;

create policy "通知は本人のみ参照"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "通知は本人のみ更新"
  on public.notifications for update
  using (auth.uid() = user_id);

-- いいねされた時に通知を作るトリガー
create or replace function public.create_like_notification()
returns trigger language plpgsql security definer as $$
declare
  review_owner uuid;
begin
  select user_id into review_owner from public.reviews where id = new.review_id;
  if review_owner is not null and review_owner <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, target_type, target_id)
    values (review_owner, new.user_id, 'like', 'review', new.review_id);
  end if;
  return new;
end $$;

drop trigger if exists trg_likes_notify on public.likes;
create trigger trg_likes_notify
after insert on public.likes
for each row execute function public.create_like_notification();

-- フォローされた時に通知を作るトリガー
create or replace function public.create_follow_notification()
returns trigger language plpgsql security definer as $$
begin
  if new.follower_id <> new.following_id then
    insert into public.notifications (user_id, actor_id, type, target_type, target_id)
    values (new.following_id, new.follower_id, 'follow', 'user', new.follower_id);
  end if;
  return new;
end $$;

drop trigger if exists trg_follows_notify on public.follows;
create trigger trg_follows_notify
after insert on public.follows
for each row execute function public.create_follow_notification();

-- ─── アカウント削除用RPC ───────────────────────────────────────────
-- 本人が呼び出せる削除関数。auth.users もカスケードで消える。
create or replace function public.delete_my_account()
returns void language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'unauthorized';
  end if;
  -- profiles, reviews, etc. は on delete cascade で連動削除される
  delete from auth.users where id = uid;
end $$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
