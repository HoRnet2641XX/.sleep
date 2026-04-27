-- プレミアム機能サポート: レビューに非公開フラグを追加
alter table public.reviews
  add column if not exists is_private boolean not null default false;

-- 非公開レビューは本人のみ閲覧可能にするため、既存のSELECTポリシーを更新
-- (既存ポリシー名はプロジェクトによって異なるので 安全に drop/create する)
drop policy if exists "レビューは誰でも閲覧可能" on public.reviews;
drop policy if exists "Reviews are viewable by everyone" on public.reviews;

create policy "レビューは誰でも閲覧可能（非公開は本人のみ）"
  on public.reviews for select
  using (
    is_private = false
    or auth.uid() = user_id
  );

-- 非公開レビューをフィードから除外するためのインデックス
create index if not exists idx_reviews_is_private
  on public.reviews(is_private, created_at desc)
  where is_private = false;
