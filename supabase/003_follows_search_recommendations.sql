-- =============================================
-- .nemuri — スキーマ拡張: フォロー・検索・レコメンド
-- Supabase SQL Editor で実行してください
-- =============================================

-- ─── フォロー ───
create table public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);

-- RLS
alter table public.follows enable row level security;
create policy "フォローは誰でも閲覧可能" on public.follows for select using (true);
create policy "フォローは認証ユーザーのみ可能" on public.follows for insert with check (auth.uid() = follower_id);
create policy "フォローは本人のみ解除可能" on public.follows for delete using (auth.uid() = follower_id);

-- ─── 検索用 trigram インデックス ───
create extension if not exists pg_trgm;
create index idx_reviews_product_name_trgm on public.reviews using gin (product_name gin_trgm_ops);
create index idx_reviews_body_trgm on public.reviews using gin (body gin_trgm_ops);

-- ─── レコメンド用 RPC ───
create or replace function public.get_recommendations(p_user_id uuid, p_limit int default 10)
returns table(review_id uuid, score int) as $$
  with user_profile as (
    select sleep_disorder_types, age_group, gender from public.profiles where id = p_user_id
  )
  select r.id as review_id,
    (coalesce(array_length(array(
      select unnest(p.sleep_disorder_types) intersect select unnest(up.sleep_disorder_types)
    ), 1), 0) * 3
    + case when p.age_group = up.age_group then 2 else 0 end
    + case when p.gender = up.gender then 1 else 0 end
    ) as score
  from public.reviews r
  join public.profiles p on p.id = r.user_id
  cross join user_profile up
  where r.user_id != p_user_id
    and r.rating >= 4
    and (p.sleep_disorder_types && up.sleep_disorder_types
         or p.age_group = up.age_group
         or p.gender = up.gender)
  order by score desc, r.likes_count desc
  limit p_limit;
$$ language sql stable;
