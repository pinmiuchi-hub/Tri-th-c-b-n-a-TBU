-- ============================================================
-- WebGIS Tây Bắc — Supabase setup (chạy 1 lần trong SQL Editor)
-- Mục đích: mọi máy mở https://pinmiuchi-hub.github.io/Tri-th-c-b-n-a-TBU/
-- đều thấy cùng một bộ dữ liệu người dùng (chung 1 bộ, ai cũng sửa được).
-- ============================================================

create table if not exists public.webgis_state (
  id         text primary key,
  payload    jsonb   not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Bật Row Level Security
alter table public.webgis_state enable row level security;

-- Bỏ policy cũ (nếu chạy lại) để script idempotent
drop policy if exists "anon read"   on public.webgis_state;
drop policy if exists "anon insert" on public.webgis_state;
drop policy if exists "anon update" on public.webgis_state;
drop policy if exists "anon delete" on public.webgis_state;

-- Mọi khách (anon key trong trình duyệt) đều ĐỌC / GHI được — đúng mode demo "ai cũng sửa được"
create policy "anon read"   on public.webgis_state for select using (true);
create policy "anon insert" on public.webgis_state for insert with check (true);
create policy "anon update" on public.webgis_state for update using (true) with check (true);
create policy "anon delete" on public.webgis_state for delete using (true);

-- Đảm bảo role anon có quyền trên bảng (Supabase thường cấp sẵn, cấp lại cho chắc)
grant usage on schema public to anon;
grant all on public.webgis_state to anon;

-- Seed 1 dòng duy nhất làm nguồn chân lý toàn cục
insert into public.webgis_state (id, payload, updated_at)
values ('global', '{}'::jsonb, now())
on conflict (id) do nothing;
