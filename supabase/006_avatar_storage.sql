-- avatars バケット: プロフィールアイコン保存用
-- file_size_limit と allowed_mime_types で DB 側でも検証
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
