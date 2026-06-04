-- profiles に体重の公開/非公開フラグを追加する。
-- 既存の挙動を維持するため、既存ユーザーは公開(true)を初期値にする。

alter table public.profiles
  add column if not exists weight_is_public boolean not null default true;
