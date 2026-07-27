-- CSL Portal — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor for project CSL-Temporary-project-database-&-Oauth

-- ---------------------------------------------------------------------------
-- Profiles (one row per signed-in Google user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'Owner' check (role in ('Owner', 'Admin', 'Viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a new user signs in via Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    'Owner'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Financial tracker — shared across all portal users (single business)
-- ---------------------------------------------------------------------------
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_custom boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.expense_categories (id) on delete cascade,
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  period_month date not null,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, period_month)
);

alter table public.expense_categories enable row level security;
alter table public.expense_entries enable row level security;

-- Only authenticated users with a profile may access finance data.
create policy "Portal users manage expense categories"
  on public.expense_categories for all
  using (exists (select 1 from public.profiles where id = auth.uid()))
  with check (exists (select 1 from public.profiles where id = auth.uid()));

create policy "Portal users manage expense entries"
  on public.expense_entries for all
  using (exists (select 1 from public.profiles where id = auth.uid()))
  with check (exists (select 1 from public.profiles where id = auth.uid()));

-- Darren's default expense categories from his P&L spreadsheet.
insert into public.expense_categories (name, is_custom, sort_order) values
  ('Card Purchases', false, 1),
  ('Services Cost & Subscrs', false, 2),
  ('Commercial Ins.', false, 3),
  ('Cargo Ins.', false, 4),
  ('Vehicle Maint.', false, 5),
  ('Fuel Cost', false, 6),
  ('Mileage Reimbursement', false, 7),
  ('Misc.', false, 8)
on conflict (name) do nothing;

-- Keep updated_at fresh on expense edits.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists expense_entries_updated_at on public.expense_entries;
create trigger expense_entries_updated_at
  before update on public.expense_entries
  for each row execute function public.set_updated_at();
