-- =============================================
-- .sleep — スキーマ拡張: 参考URL・比較データ
-- Supabase SQL Editor で実行してください
-- =============================================

-- レビューに参考URLカラムを追加
alter table public.reviews add column if not exists reference_url text;

-- レビューに比較データカラムを追加（JSON配列）
-- 例: [{"name": "商品A", "price": 3000, "rating": 4, "note": "コスパ良い"}]
alter table public.reviews add column if not exists comparison_items jsonb default '[]';
