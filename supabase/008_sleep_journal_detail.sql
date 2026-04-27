-- sleep_journals にリッチな睡眠詳細フィールドを追加
alter table public.sleep_journals
  add column if not exists sleep_hours numeric(3,1) check (sleep_hours >= 0 and sleep_hours <= 24),
  add column if not exists wake_count smallint check (wake_count >= 0 and wake_count <= 20),
  add column if not exists ease_of_sleep smallint check (ease_of_sleep between 1 and 5);

-- コメント
comment on column public.sleep_journals.sleep_hours is '睡眠時間(時間単位・0.5刻み)';
comment on column public.sleep_journals.wake_count is '夜中の起床回数';
comment on column public.sleep_journals.ease_of_sleep is '寝つきの良さ(1=悪い, 5=良い)';
