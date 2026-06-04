-- =====================================================
-- FRI DASHBOARD - SUPABASE SCHEMA TABEL TERPISAH
-- =====================================================
-- Jalankan semua SQL ini di Supabase SQL Editor.
-- Setelah berhasil, data tidak lagi dikumpulkan di app_state,
-- tetapi disimpan pada tabel terpisah yang lebih rapi.
-- =====================================================

-- Optional: app_state lama dibiarkan untuk backup/kompatibilitas.
create table if not exists public.app_state (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  client_id text primary key,
  username text unique,
  nama text,
  password text,
  role text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pengajuan_bhp (
  client_id text primary key,
  pengaju text,
  username text,
  laboratorium text,
  pic text,
  nama_barang text,
  tanggal_pengajuan date,
  proposal text,
  revisi text,
  status text,
  tahap text,
  komentar text,
  total numeric default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.honorarium (
  client_id text primary key,
  pengaju text,
  username text,
  laboratorium text,
  pic text,
  periode_mulai date,
  periode_selesai date,
  total_asisten numeric default 0,
  total_honor numeric default 0,
  bap_praktikum text,
  status text,
  tahap text,
  komentar text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  client_id text primary key,
  target_role text,
  target_username text,
  title text,
  message text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  client_id text primary key,
  role text,
  aksi text,
  modul text,
  detail text,
  created_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_transactions (
  client_id text primary key,
  tanggal date,
  kategori text,
  laboratorium text,
  deskripsi text,
  nominal numeric default 0,
  sumber text,
  status text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulasi_anggaran (
  client_id text primary key,
  laboratorium text,
  tipe text,
  tw1 numeric default 0,
  tw2 numeric default 0,
  tw3 numeric default 0,
  tw4 numeric default 0,
  total numeric default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monitoring_budget (
  id int primary key default 1,
  total_anggaran numeric default 0,
  payload jsonb not null default '0'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monitoring_budget_single_row check (id = 1)
);

-- ================= RLS =================

alter table public.app_state enable row level security;
alter table public.users enable row level security;
alter table public.pengajuan_bhp enable row level security;
alter table public.honorarium enable row level security;
alter table public.notifications enable row level security;
alter table public.activities enable row level security;
alter table public.daily_transactions enable row level security;
alter table public.simulasi_anggaran enable row level security;
alter table public.monitoring_budget enable row level security;

-- Prototype/TA policy: anon dan authenticated boleh CRUD.
-- Untuk produksi sungguhan, policy ini perlu diperketat.

do $$
declare
  t text;
begin
  foreach t in array array[
    'app_state',
    'users',
    'pengajuan_bhp',
    'honorarium',
    'notifications',
    'activities',
    'daily_transactions',
    'simulasi_anggaran',
    'monitoring_budget'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_select_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_all', t);

    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t || '_select_all', t);
    execute format('create policy %I on public.%I for insert to anon, authenticated with check (true)', t || '_insert_all', t);
    execute format('create policy %I on public.%I for update to anon, authenticated using (true) with check (true)', t || '_update_all', t);
    execute format('create policy %I on public.%I for delete to anon, authenticated using (true)', t || '_delete_all', t);
  end loop;
end $$;

-- ================= REALTIME =================

do $$
begin
  alter publication supabase_realtime add table public.users;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.pengajuan_bhp;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.honorarium;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.activities;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.daily_transactions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.simulasi_anggaran;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.monitoring_budget;
exception when duplicate_object then null;
end $$;

-- ================= DATA AWAL =================

insert into public.users (client_id, username, nama, password, role, payload)
values
  ('laboran', 'laboran', 'Staff Laboratorium', 'laboran123', 'laboran', '{"username":"laboran","password":"laboran123","role":"laboran","nama":"Staff Laboratorium"}'::jsonb),
  ('keuangan', 'keuangan', 'Staff Keuangan', 'keuangan123', 'keuangan', '{"username":"keuangan","password":"keuangan123","role":"keuangan","nama":"Staff Keuangan"}'::jsonb)
on conflict (client_id) do nothing;

insert into public.monitoring_budget (id, total_anggaran, payload)
values (1, 0, '0'::jsonb)
on conflict (id) do nothing;
