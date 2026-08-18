-- ===========================================================================
-- CSL Portal — migration 003
-- Editable, persistent statuses everywhere
--
-- Run this in Supabase Dashboard → SQL Editor. It is idempotent: running it
-- twice is safe. Requires migrations 001 and 002 to have run first.
--
-- What this adds
-- --------------
-- Darren asked to be able to CHANGE the status chips rather than just read
-- them — "Action required — Darren" on a document, "Awaiting Darren's
-- approval — not sent" on an outreach draft, and the stage on an opportunity.
-- Those changes have to survive a refresh and be visible to everyone.
--
-- Two pieces:
--
-- 1. pipeline_state gains 'Won' and 'Lost' as distinct values. An opportunity
--    can be Won or Lost as separate facts, but the kanban board only has one
--    "Won/Lost" column. Previously only the merged value could be stored,
--    which meant setting an opportunity to "Won" from the detail page would
--    have thrown away which of the two it was. The board still renders both in
--    the same column; the record keeps the distinction.
--
-- 2. record_status — one shared override row per record for everything that
--    is NOT an opportunity: documents, generated documents, outreach drafts
--    and veterinary leads. Same shape and same sharing rules as
--    pipeline_state, so the whole portal behaves consistently.
--
-- Why opportunities are NOT in record_status: an opportunity's status and its
-- position on the pipeline board are the SAME FACT. Storing it twice would let
-- the two drift apart, and the first time they disagreed nobody would know
-- which was right. pipeline_state stays the single source of truth for it.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Allow Won / Lost to be stored distinctly on the pipeline
-- ---------------------------------------------------------------------------
alter table public.pipeline_state
  drop constraint if exists pipeline_state_stage_check;

alter table public.pipeline_state
  add constraint pipeline_state_stage_check
  check (stage in ('Found', 'Qualified', 'Contacted', 'Meeting', 'Bid',
                   'Won/Lost', 'Won', 'Lost'));

-- Provenance columns already exist from 002 (moved_by, moved_by_name,
-- moved_at). Added here only if 002 was applied in an older form.
alter table public.pipeline_state add column if not exists moved_by uuid references auth.users (id) on delete set null;
alter table public.pipeline_state add column if not exists moved_by_name text;
alter table public.pipeline_state add column if not exists moved_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 2. Shared status overrides for everything that is not an opportunity
-- ---------------------------------------------------------------------------
create table if not exists public.record_status (
  -- Which kind of thing this status belongs to. Namespaced so a document and
  -- an outreach draft can never collide on the same id.
  subject_kind text not null
    check (subject_kind in ('document', 'generated-doc', 'outreach', 'vet-lead')),

  -- The record's id from the repo's data layer, e.g. 'capability-statement',
  -- 'OUT-2026-011', 'VET-2026-003'.
  subject_id text not null,

  -- Deliberately NOT constrained to a fixed list. Each kind has its own set of
  -- valid statuses and those sets change as the product grows; the app owns
  -- that vocabulary. A CHECK here would mean a database migration every time a
  -- status label is added, and a hard failure in the UI when they fell out of
  -- step. Length is bounded instead.
  status text not null check (char_length(status) between 1 and 40),

  -- Optional free-text reason, e.g. why something was marked closed.
  note text check (note is null or char_length(note) <= 500),

  changed_by uuid references auth.users (id) on delete set null,
  changed_by_name text,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  primary key (subject_kind, subject_id)
);

alter table public.record_status enable row level security;

-- Any portal user may read and change any status. These are shared business
-- facts — if Darren approves a draft, it is approved for everyone.
drop policy if exists "Portal users manage record status" on public.record_status;
create policy "Portal users manage record status"
  on public.record_status for all
  using (exists (select 1 from public.profiles where id = auth.uid()))
  with check (exists (select 1 from public.profiles where id = auth.uid()));

-- Keep changed_at honest on every update.
create or replace function public.touch_record_status()
returns trigger
language plpgsql
as $$
begin
  new.changed_at = now();
  return new;
end;
$$;

drop trigger if exists record_status_touch on public.record_status;
create trigger record_status_touch
  before update on public.record_status
  for each row execute function public.touch_record_status();

-- Fast lookup of "every override of this kind", which is how the portal loads
-- them — one query per kind at sign-in rather than one per card.
create index if not exists record_status_kind_idx
  on public.record_status (subject_kind);

-- ---------------------------------------------------------------------------
-- 3. Realtime (optional)
-- ---------------------------------------------------------------------------
-- So a status Darren changes on his phone updates on someone else's screen
-- without a refresh. Wrapped so the migration still succeeds where the
-- supabase_realtime publication does not exist.
do $$
begin
  begin
    alter publication supabase_realtime add table public.record_status;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end
$$;
