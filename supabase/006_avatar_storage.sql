-- avatars バケット: プロフィールアイコン保存用
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- 既存ポリシーを削除して再作成（冪等）
drop policy if exists "avatar_public_read" on storage.objects;
drop policy if exists "avatar_owner_write" on storage.objects;
drop policy if exists "avatar_owner_update" on storage.objects;
drop policy if exists "avatar_owner_delete" on storage.objects;

-- 誰でも参照可（publicバケット）
create policy "avatar_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 自分のuser_id プレフィックスのみアップロード可
create policy "avatar_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 自分のファイルのみ更新可
create policy "avatar_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 自分のファイルのみ削除可
create policy "avatar_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
