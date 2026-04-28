-- ─── 入力長制限を後付けで追加 ───
-- スパム・DOS・ストレージ枯渇を防ぐ

-- reviews 本文 1〜2000文字
alter table public.reviews
  drop constraint if exists reviews_body_length;
alter table public.reviews
  add constraint reviews_body_length
  check (char_length(body) between 1 and 2000);

-- reviews 商品名 1〜200文字
alter table public.reviews
  drop constraint if exists reviews_product_name_length;
alter table public.reviews
  add constraint reviews_product_name_length
  check (char_length(product_name) between 1 and 200);

-- comments 本文 1〜500文字
alter table public.comments
  drop constraint if exists comments_body_length;
alter table public.comments
  add constraint comments_body_length
  check (char_length(body) between 1 and 500);

-- profiles ニックネーム 1〜30文字
alter table public.profiles
  drop constraint if exists profiles_nickname_length;
alter table public.profiles
  add constraint profiles_nickname_length
  check (char_length(nickname) between 1 and 30);

-- profiles きっかけ 0〜500文字
alter table public.profiles
  drop constraint if exists profiles_cause_length;
alter table public.profiles
  add constraint profiles_cause_length
  check (cause is null or char_length(cause) <= 500);

-- contact_messages のフィールド制限 + メールフォーマット
alter table public.contact_messages
  drop constraint if exists contact_messages_email_format;
alter table public.contact_messages
  add constraint contact_messages_email_format
  check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

alter table public.contact_messages
  drop constraint if exists contact_messages_subject_length;
alter table public.contact_messages
  add constraint contact_messages_subject_length
  check (char_length(subject) between 1 and 200);

alter table public.contact_messages
  drop constraint if exists contact_messages_body_length;
alter table public.contact_messages
  add constraint contact_messages_body_length
  check (char_length(body) between 5 and 5000);

-- sleep_journals メモ 0〜500文字
alter table public.sleep_journals
  drop constraint if exists sleep_journals_body_length;
alter table public.sleep_journals
  add constraint sleep_journals_body_length
  check (body is null or char_length(body) <= 500);

-- ─── レート制限関数 ───
-- 同一ユーザーの直近X秒以内の投稿数をカウントしてN件超えで拒否
-- アプリ層からこの関数を呼んで判定する設計

create or replace function public.check_rate_limit(
  table_name text,
  user_uid uuid,
  window_seconds int default 60,
  max_count int default 5
) returns boolean
language plpgsql security definer as $$
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
  elsif table_name = 'contact_messages' then
    select count(*) into cnt from public.contact_messages
    where user_id = user_uid
      and created_at > now() - make_interval(secs => window_seconds);
  else
    return false;
  end if;
  return cnt < max_count;
end $$;

grant execute on function public.check_rate_limit(text, uuid, int, int) to authenticated;

-- ─── DBレベルでのレート制限トリガー ───
-- 各テーブルへのINSERT前にチェック

create or replace function public.enforce_rate_limit_reviews()
returns trigger language plpgsql security definer as $$
begin
  if not public.check_rate_limit('reviews', new.user_id, 60, 5) then
    raise exception 'Rate limit exceeded: max 5 reviews per minute' using errcode = '42P10';
  end if;
  return new;
end $$;

drop trigger if exists trg_reviews_rate_limit on public.reviews;
create trigger trg_reviews_rate_limit
before insert on public.reviews
for each row execute function public.enforce_rate_limit_reviews();

create or replace function public.enforce_rate_limit_comments()
returns trigger language plpgsql security definer as $$
begin
  if not public.check_rate_limit('comments', new.user_id, 60, 10) then
    raise exception 'Rate limit exceeded: max 10 comments per minute' using errcode = '42P10';
  end if;
  return new;
end $$;

drop trigger if exists trg_comments_rate_limit on public.comments;
create trigger trg_comments_rate_limit
before insert on public.comments
for each row execute function public.enforce_rate_limit_comments();

create or replace function public.enforce_rate_limit_reports()
returns trigger language plpgsql security definer as $$
begin
  if not public.check_rate_limit('reports', new.reporter_id, 300, 3) then
    raise exception 'Rate limit exceeded: max 3 reports per 5 minutes' using errcode = '42P10';
  end if;
  return new;
end $$;

drop trigger if exists trg_reports_rate_limit on public.reports;
create trigger trg_reports_rate_limit
before insert on public.reports
for each row execute function public.enforce_rate_limit_reports();
