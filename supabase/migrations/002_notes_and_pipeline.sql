-- ===========================================================================
-- CSL Portal — migration 002
-- Shared opportunity notes + persistent pipeline stages
--
-- Run this in Supabase Dashboard → SQL Editor for the CSL portal project.
-- It is idempotent: running it twice is safe.
--
-- Why these two tables exist
-- --------------------------
-- 1. record_notes — the portal previously had nowhere to write down what
--    happened on a call. Notes are SHARED and ATTRIBUTED: everyone sees the
--    same thread, each entry stamped with who wrote it, and only the author
--    can edit or delete their own entry. A body is capped at 3,000 characters
--    in the database, not just in the textarea, so the limit is real.
--
-- 2. pipeline_state — dragging a card used to live in React state alone, so
--    every refresh threw the change away. Stage is a fact about the deal
--    rather than a per-person preference, so this table holds ONE row per
--    opportunity and every portal user reads and writes the same board.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Shared, attributed notes on any portal record (opportunity or vet lead)
-- ---------------------------------------------------------------------------
create table if not exists public.record_notes (
  id uuid primary key default gen_random_uuid(),

  -- Which record this note hangs off, e.g. 'OPP-2026-030' or 'VET-2026-004'.
  -- Deliberately text rather than a foreign key: opportunities live in the
  -- repo's typed data layer (lib/data/), not in Postgres, so there is no table
  -- to reference. The engine owns the records; Postgres owns what humans add.
  subject_id text not null,

  -- Namespaces the id so an opportunity and a vet lead can never collide.
  subject_kind text not null default 'opportunity'
    check (subject_kind in ('opportunity', 'vet-lead')),

  -- 3,000 characters, enforced here so the cap survives any future UI.
  body text not null check (char_length(body) between 1 and 3000),

  author_id uuid not null references auth.users (id) on delete cascade,
  -- Denormalised on purpose: a note must still say who wrote it even if that
  -- account is later removed from the portal, and RLS on profiles would
  -- otherwise stop one user from resolving another user's name.
  author_email text not null,
  author_name text,

  -- True once the author has changed the body, so the UI can say "edited"
  -- rather than silently rewriting history.
  edited boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The only query the app makes: "every note on this record, newest first".
create index if not exists record_notes_subject_idx
  on public.record_notes (subject_kind, subject_id, created_at desc);

alter table public.record_notes enable row level security;

-- Everyone with a portal profile reads the whole thread — that is the point of
-- shared notes.
drop policy if exists "Portal users read all notes" on public.record_notes;
create policy "Portal users read all notes"
  on public.record_notes for select
  using (exists (select 1 from public.profiles where id = auth.uid()));

-- You may only write notes as yourself.
drop policy if exists "Portal users write own notes" on public.record_notes;
create policy "Portal users write own notes"
  on public.record_notes for insert
  with check (
    auth.uid() = author_id
    and exists (select 1 from public.profiles where id = auth.uid())
  );

drop policy if exists "Authors update own notes" on public.record_notes;
create policy "Authors update own notes"
  on public.record_notes for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Authors delete own notes" on public.record_notes;
create policy "Authors delete own notes"
  on public.record_notes for delete
  using (auth.uid() = author_id);

-- Stamp updated_at and flag the note as edited whenever the body changes.
create or replace function public.touch_record_note()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.body is distinct from old.body then
    new.edited = true;
  end if;
  return new;
end;
$$;

drop trigger if exists record_notes_touch on public.record_notes;
create trigger record_notes_touch
  before update on public.record_notes
  for each row execute function public.touch_record_note();

-- ---------------------------------------------------------------------------
-- Pipeline stage — ONE shared board for the business
-- ---------------------------------------------------------------------------
create table if not exists public.pipeline_state (
  -- One row per opportunity. The primary key is what makes the upsert on drop
  -- idempotent, and it is what guarantees two users cannot hold the same card
  -- in two different stages.
  opportunity_id text primary key,

  stage text not null
    check (stage in ('Found', 'Qualified', 'Contacted', 'Meeting', 'Bid', 'Won/Lost')),

  -- Who moved it last, kept so the board can show provenance rather than
  -- cards silently rearranging themselves under someone else's cursor.
  moved_by uuid references auth.users (id) on delete set null,
  moved_by_name text,
  moved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.pipeline_state enable row level security;

-- Any portal user may read and change the shared board.
drop policy if exists "Portal users manage pipeline state" on public.pipeline_state;
create policy "Portal users manage pipeline state"
  on public.pipeline_state for all
  using (exists (select 1 from public.profiles where id = auth.uid()))
  with check (exists (select 1 from public.profiles where id = auth.uid()));

create or replace function public.touch_pipeline_state()
returns trigger
language plpgsql
as $$
begin
  new.moved_at = now();
  return new;
end;
$$;

drop trigger if exists pipeline_state_touch on public.pipeline_state;
create trigger pipeline_state_touch
  before update on public.pipeline_state
  for each row execute function public.touch_pipeline_state();

-- ---------------------------------------------------------------------------
-- Realtime (optional)
-- ---------------------------------------------------------------------------
-- Lets a card move on Darren's screen the moment someone else drops it, rather
-- than on next refresh. Wrapped so the migration still succeeds on a project
-- where the supabase_realtime publication does not exist — the portal works
-- either way, it just falls back to refresh-to-see.
do $$
begin
  begin
    alter publication supabase_realtime add table public.pipeline_state;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.record_notes;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end
$$;
