-- ============================================================
-- ERIC 2026 — LIVE QUOTA COUNTER (Supabase)
-- Jalankan SQL ini DI SEKALI di Supabase SQL Editor:
--   Dashboard Supabase -> SQL Editor -> New query -> paste -> Run
-- ============================================================

-- 1) Tabel counter kuota per divisi (hanya angka, BUKAN data peserta/gambar)
create table if not exists public.division_quotas (
  division_id text primary key,
  count        integer not null default 0,
  updated_at   timestamptz not null default now()
);

-- 2) Fungsi increment atomik: naikkan count +1 utk sebuah divisi.
--    INSERT ... ON CONFLICT supaya baris auto-buat kalau belum ada.
--    `security definer` + revoke membuat anon hanya boleh lewat panggil fungsi ini.
create or replace function public.increment_division_quota(p_division_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.division_quotas (division_id, count, updated_at)
  values (p_division_id, 1, now())
  on conflict (division_id)
  do update set count = public.division_quotas.count + 1,
                updated_at = now()
  returning count into v_count;
  return v_count;
end;
$$;

-- 3) Fungsi SET/override manual: atur count jadi angka tertentu (utk seed awal).
create or replace function public.set_division_quota(p_division_id text, p_count integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.division_quotas (division_id, count, updated_at)
  values (p_division_id, p_count, now())
  on conflict (division_id)
  do update set count = p_count,
                updated_at = now()
  returning count into v_count;
  return v_count;
end;
$$;

-- 4) RLS: aktifkan, namun semua role (termasuk anon) boleh
--    SELECT (baca) dan boleh memanggil 2 fungsi di atas.
alter table public.division_quotas enable row level security;

drop policy if exists "public read division quotas" on public.division_quotas;
create policy "public read division quotas"
  on public.division_quotas for select
  using (true);

-- 5) Izin utk anon (dipakai frontend): boleh select table
--    & execute fungsi RPC.
grant select on table public.division_quotas to anon;
grant execute on function public.increment_division_quota(text) to anon;
grant execute on function public.set_division_quota(text, integer) to anon;

-- (Optional) agar tidak bisa update/delete langsung oleh anon —
--   anon TIDAK diberi grant insert/update/delete, hanya lewat fungsi.
-- ============================================================
