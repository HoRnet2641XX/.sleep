-- ─── セキュリティ強化 ───────────────────────────────────────────
-- 1. 公開プロフィールを public_profiles に分離し、profiles 本体は本人のみ参照
-- 2. is_premium のクライアント更新をDBで拒否
-- 3. 非公開レビューはプレミアムユーザーだけ作成/更新可能にする
-- 4. security definer 関数の search_path を固定
-- 5. お問い合わせの簡易レート制限を追加

create table if not exists public.public_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  height integer,
  weight integer,
  weight_is_public boolean not null default true,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  age_group text,
  sleep_disorder_types text[] not null default '{}',
  cause text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.public_profiles enable row level security;

drop policy if exists "公開プロフィールは誰でも閲覧可能" on public.public_profiles;
create policy "公開プロフィールは誰でも閲覧可能"
  on public.public_profiles for select
  using (true);

insert into public.public_profiles (
  user_id,
  nickname,
  avatar_url,
  height,
  weight,
  weight_is_public,
  gender,
  age_group,
  sleep_disorder_types,
  cause,
  created_at,
  updated_at
)
select
  id,
  nickname,
  avatar_url,
  height,
  case when weight_is_public then weight else null end,
  weight_is_public,
  gender,
  age_group,
  coalesce(sleep_disorder_types, '{}'),
  cause,
  created_at,
  updated_at
from public.profiles
on conflict (user_id) do update set
  nickname = excluded.nickname,
  avatar_url = excluded.avatar_url,
  height = excluded.height,
  weight = excluded.weight,
  weight_is_public = excluded.weight_is_public,
  gender = excluded.gender,
  age_group = excluded.age_group,
  sleep_disorder_types = excluded.sleep_disorder_types,
  cause = excluded.cause,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

create or replace function public.sync_public_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.public_profiles (
    user_id,
    nickname,
    avatar_url,
    height,
    weight,
    weight_is_public,
    gender,
    age_group,
    sleep_disorder_types,
    cause,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.nickname,
    new.avatar_url,
    new.height,
    case when new.weight_is_public then new.weight else null end,
    new.weight_is_public,
    new.gender,
    new.age_group,
    coalesce(new.sleep_disorder_types, '{}'),
    new.cause,
    new.created_at,
    new.updated_at
  )
  on conflict (user_id) do update set
    nickname = excluded.nickname,
    avatar_url = excluded.avatar_url,
    height = excluded.height,
    weight = excluded.weight,
    weight_is_public = excluded.weight_is_public,
    gender = excluded.gender,
    age_group = excluded.age_group,
    sleep_disorder_types = excluded.sleep_disorder_types,
    cause = excluded.cause,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at;

  return new;
end $$;

drop trigger if exists trg_sync_public_profile on public.profiles;
create trigger trg_sync_public_profile
after insert or update of
  nickname,
  avatar_url,
  height,
  weight,
  weight_is_public,
  gender,
  age_group,
  sleep_disorder_types,
  cause,
  updated_at
on public.profiles
for each row execute function public.sync_public_profile();

-- profiles 本体は本人だけ参照。公開画面は public_profiles を使う。
drop policy if exists "プロフィールは誰でも閲覧可能" on public.profiles;
drop policy if exists "プロフィールは本人のみ参照" on public.profiles;
create policy "プロフィールは本人のみ参照"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "プロフィールは本人のみ編集可能" on public.profiles;
create policy "プロフィールは本人のみ編集可能"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "プロフィールは本人のみ作成可能" on public.profiles;
create policy "プロフィールは本人のみ作成可能"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

create or replace function public.prevent_profile_protected_client_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_role text := current_setting('request.jwt.claim.role', true);
begin
  if coalesce(request_role, '') in ('anon', 'authenticated') then
    if new.is_premium is distinct from old.is_premium then
      raise exception 'protected profile column cannot be changed';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_prevent_profile_protected_client_update on public.profiles;
create trigger trg_prevent_profile_protected_client_update
before update on public.profiles
for each row execute function public.prevent_profile_protected_client_update();

create or replace function public.enforce_private_review_entitlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.is_private, false) then
    if not exists (
      select 1
      from public.profiles
      where id = new.user_id
        and is_premium = true
    ) then
      raise exception 'private reviews require premium';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_enforce_private_review_entitlement on public.reviews;
create trigger trg_enforce_private_review_entitlement
before insert or update of is_private, user_id on public.reviews
for each row execute function public.enforce_private_review_entitlement();

-- recommendations は本人の非公開 profile と投稿者の公開 profile を使う。
create or replace function public.get_recommendations(p_user_id uuid, p_limit int default 10)
returns table(review_id uuid, score int)
language sql
stable
as $$
  with user_profile as (
    select sleep_disorder_types, age_group, gender
    from public.profiles
    where id = p_user_id
      and id = (select auth.uid())
  )
  select r.id as review_id,
    (coalesce(array_length(array(
      select unnest(p.sleep_disorder_types) intersect select unnest(up.sleep_disorder_types)
    ), 1), 0) * 3
    + case when p.age_group = up.age_group then 2 else 0 end
    + case when p.gender = up.gender then 1 else 0 end
    ) as score
  from public.reviews r
  join public.public_profiles p on p.user_id = r.user_id
  cross join user_profile up
  where r.user_id != p_user_id
    and r.rating >= 4
    and (p.sleep_disorder_types && up.sleep_disorder_types
         or p.age_group = up.age_group
         or p.gender = up.gender)
  order by score desc, r.likes_count desc
  limit p_limit;
$$;

create or replace function public.update_review_likes_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT') then
    update public.reviews set likes_count = likes_count + 1 where id = new.review_id;
  elsif (tg_op = 'DELETE') then
    update public.reviews set likes_count = likes_count - 1 where id = old.review_id;
  end if;
  return null;
end $$;

create or replace function public.update_review_comments_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT') then
    update public.reviews set comments_count = comments_count + 1 where id = new.review_id;
  elsif (tg_op = 'DELETE') then
    update public.reviews set comments_count = comments_count - 1 where id = old.review_id;
  end if;
  return null;
end $$;

create or replace function public.create_like_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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

create or replace function public.create_follow_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.follower_id <> new.following_id then
    insert into public.notifications (user_id, actor_id, type, target_type, target_id)
    values (new.following_id, new.follower_id, 'follow', 'user', new.follower_id);
  end if;
  return new;
end $$;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'unauthorized';
  end if;
  delete from auth.users where id = uid;
end $$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

create or replace function public.check_rate_limit(
  table_name text,
  user_uid uuid,
  window_seconds int default 60,
  max_count int default 5
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  cnt int;
begin
  if table_name = 'reviews' then
    select count(*) into cnt from public.reviews
    where user_id = user_uid
      and created_at > now() - make_interval(secs => window_seconds);
  elsif table_name = 'comments' then
    select count(*) into cnt from public.comments
    where user_id = user_uid
      and created_at > now() - make_interval(secs => window_seconds);
  elsif table_name = 'reports' then
    select count(*) into cnt from public.reports
    where reporter_id = user_uid
      and created_at > now() - make_interval(secs => window_seconds);
  else
    return false;
  end if;
  return cnt < max_count;
end $$;

revoke all on function public.check_rate_limit(text, uuid, int, int) from public;
revoke all on function public.check_rate_limit(text, uuid, int, int) from anon;
revoke all on function public.check_rate_limit(text, uuid, int, int) from authenticated;

create or replace function public.enforce_rate_limit_reviews()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.check_rate_limit('reviews', new.user_id, 60, 5) then
    raise exception 'Rate limit exceeded: max 5 reviews per minute' using errcode = '42P10';
  end if;
  return new;
end $$;

create or replace function public.enforce_rate_limit_comments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.check_rate_limit('comments', new.user_id, 60, 10) then
    raise exception 'Rate limit exceeded: max 10 comments per minute' using errcode = '42P10';
  end if;
  return new;
end $$;

create or replace function public.enforce_rate_limit_reports()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.check_rate_limit('reports', new.reporter_id, 300, 3) then
    raise exception 'Rate limit exceeded: max 3 reports per 5 minutes' using errcode = '42P10';
  end if;
  return new;
end $$;

create or replace function public.enforce_rate_limit_contact_messages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cnt int;
begin
  select count(*) into cnt
  from public.contact_messages
  where lower(email) = lower(new.email)
    and created_at > now() - interval '10 minutes';

  if cnt >= 3 then
    raise exception 'Rate limit exceeded: max 3 contact messages per 10 minutes' using errcode = '42P10';
  end if;

  return new;
end $$;

drop trigger if exists trg_contact_messages_rate_limit on public.contact_messages;
create trigger trg_contact_messages_rate_limit
before insert on public.contact_messages
for each row execute function public.enforce_rate_limit_contact_messages();
