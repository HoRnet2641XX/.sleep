-- =============================================
-- .sleep — データベーススキーマ
-- Supabase SQL Editor で実行してください
-- =============================================

-- ─── ユーザープロフィール ───
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text not null,
  avatar_url text,
  height integer,           -- cm
  weight integer,           -- kg
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  age_group text,           -- '20代', '30代' 等
  sleep_disorder_types text[] default '{}',  -- {'insomnia', 'middle_awakening', 'early_awakening', 'other'}
  cause text,               -- きっかけ（自由記述）
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ─── レビュー ───
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null check (category in ('medicine', 'mattress', 'pillow', 'chair', 'habit')),
  product_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  effect_level text not null check (effect_level in ('none', 'slight', 'clear', 'significant')),
  usage_period text not null check (usage_period in ('under_1_week', '1_month', '3_months', '6_months', 'over_1_year')),
  body text not null,
  image_urls text[] default '{}',
  likes_count integer default 0 not null,
  comments_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ─── コメント ───
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  review_id uuid references public.reviews(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now() not null
);

-- ─── いいね ───
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  review_id uuid references public.reviews(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(review_id, user_id) -- 1ユーザー1いいね
);

-- ─── ブックマーク ───
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  review_id uuid references public.reviews(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(review_id, user_id)
);

-- ─── インデックス ───
create index idx_reviews_category on public.reviews(category);
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_created_at on public.reviews(created_at desc);
create index idx_reviews_likes_count on public.reviews(likes_count desc);
create index idx_comments_review_id on public.comments(review_id);
create index idx_likes_review_id on public.likes(review_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_bookmarks_user_id on public.bookmarks(user_id);

-- ─── RLS (Row Level Security) ───
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;

-- プロフィール: 誰でも閲覧可、本人のみ編集
create policy "プロフィールは誰でも閲覧可能" on public.profiles for select using (true);
create policy "プロフィールは本人のみ編集可能" on public.profiles for update using (auth.uid() = id);
create policy "プロフィールは本人のみ作成可能" on public.profiles for insert with check (auth.uid() = id);

-- レビュー: 誰でも閲覧可、認証ユーザーのみ投稿、本人のみ編集/削除
create policy "レビューは誰でも閲覧可能" on public.reviews for select using (true);
create policy "レビューは認証ユーザーのみ投稿可能" on public.reviews for insert with check (auth.uid() = user_id);
create policy "レビューは本人のみ編集可能" on public.reviews for update using (auth.uid() = user_id);
create policy "レビューは本人のみ削除可能" on public.reviews for delete using (auth.uid() = user_id);

-- コメント: 誰でも閲覧可、認証ユーザーのみ投稿、本人のみ削除
create policy "コメントは誰でも閲覧可能" on public.comments for select using (true);
create policy "コメントは認証ユーザーのみ投稿可能" on public.comments for insert with check (auth.uid() = user_id);
create policy "コメントは本人のみ削除可能" on public.comments for delete using (auth.uid() = user_id);

-- いいね: 誰でも閲覧可、認証ユーザーのみ操作
create policy "いいねは誰でも閲覧可能" on public.likes for select using (true);
create policy "いいねは認証ユーザーのみ可能" on public.likes for insert with check (auth.uid() = user_id);
create policy "いいねは本人のみ取消可能" on public.likes for delete using (auth.uid() = user_id);

-- ブックマーク: 本人のみ閲覧/操作
create policy "ブックマークは本人のみ閲覧可能" on public.bookmarks for select using (auth.uid() = user_id);
create policy "ブックマークは認証ユーザーのみ可能" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "ブックマークは本人のみ取消可能" on public.bookmarks for delete using (auth.uid() = user_id);

-- ─── いいね/コメント数の自動更新 ───
create or replace function public.update_review_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.reviews set likes_count = likes_count + 1 where id = NEW.review_id;
  elsif (TG_OP = 'DELETE') then
    update public.reviews set likes_count = likes_count - 1 where id = OLD.review_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.update_review_likes_count();

create or replace function public.update_review_comments_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.reviews set comments_count = comments_count + 1 where id = NEW.review_id;
  elsif (TG_OP = 'DELETE') then
    update public.reviews set comments_count = comments_count - 1 where id = OLD.review_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.update_review_comments_count();
