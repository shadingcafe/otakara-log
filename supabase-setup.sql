-- オタカラ記録帳 Supabase セットアップSQL
-- Supabase Dashboard > SQL Editor で実行してください
-- ※ Auth > Providers > Anonymous Sign-ins も有効化してください

create table treasures (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  user_id         text,
  name            text not null,
  scientific_name text not null,
  weight          numeric(6,2) not null,
  energy          integer not null,
  description     text not null,
  image           text not null,
  rotation        numeric(3,1) not null check (rotation >= -5 and rotation <= 5),
  raw_response    jsonb
);

create index on treasures (user_id, created_at desc);

alter table treasures enable row level security;

create policy "users can view own treasures"
  on treasures for select
  using (auth.uid()::text = user_id);

create policy "users can insert own treasures"
  on treasures for insert
  with check (auth.uid()::text = user_id);

create policy "users can delete own treasures"
  on treasures for delete
  using (auth.uid()::text = user_id);
