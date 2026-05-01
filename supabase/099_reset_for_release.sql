-- ============================================
-- リリース前: テストデータ全削除
-- ============================================
-- 警告: 全ユーザー・全データを完全に削除します。実行前にバックアップを取得してください。
-- 実行: Supabase SQL Editor で全文をペースト → Run
--
-- このスクリプトの動作:
--  1. アプリケーションテーブルの全レコードを削除（FK の CASCADE で自動連鎖もする）
--  2. auth.users を全削除（→ profiles 等が CASCADE で連動削除）
--  3. Stripe テスト購入の subscriptions も削除
--
-- 削除されるもの:
--  - 全ユーザーアカウント (auth.users)
--  - profiles, reviews, comments, likes, bookmarks, follows
--  - sleep_journals, contact_messages, reports, blocks, notifications, subscriptions
--
-- 削除されないもの:
--  - テーブル定義・RLS・関数・トリガー
--  - storage.buckets の avatars バケット定義
--  - avatars バケット内のファイル本体は別途 storage.objects から削除
-- ============================================

begin;

-- アプリケーションテーブルを順次空にする
-- (auth.users 削除でも CASCADE するが、明示的にやることで Storage 内の参照も切れる)
truncate table public.notifications restart identity cascade;
truncate table public.reports restart identity cascade;
truncate table public.blocks restart identity cascade;
truncate table public.contact_messages restart identity cascade;
truncate table public.sleep_journals restart identity cascade;
truncate table public.subscriptions restart identity cascade;
truncate table public.bookmarks restart identity cascade;
truncate table public.likes restart identity cascade;
truncate table public.comments restart identity cascade;
truncate table public.follows restart identity cascade;
truncate table public.reviews restart identity cascade;
truncate table public.profiles restart identity cascade;

-- 全ユーザーを削除（profiles と再びリンクするものは既にCASCADEで消えている）
delete from auth.users;

-- avatars バケット内のファイル本体を削除（バケット定義は残す）
delete from storage.objects where bucket_id = 'avatars';

commit;

-- 確認用: 全テーブルが空になっているか
select 'auth.users' as tbl, count(*) from auth.users
union all select 'profiles', count(*) from public.profiles
union all select 'reviews', count(*) from public.reviews
union all select 'comments', count(*) from public.comments
union all select 'likes', count(*) from public.likes
union all select 'bookmarks', count(*) from public.bookmarks
union all select 'follows', count(*) from public.follows
union all select 'sleep_journals', count(*) from public.sleep_journals
union all select 'subscriptions', count(*) from public.subscriptions
union all select 'notifications', count(*) from public.notifications
union all select 'reports', count(*) from public.reports
union all select 'blocks', count(*) from public.blocks
union all select 'contact_messages', count(*) from public.contact_messages
union all select 'storage.objects (avatars)', count(*) from storage.objects where bucket_id = 'avatars';
