-- ===========================================================================
-- CSL Portal — migration 004
-- Customers · Quotes · Jobs · Finance linkage
--
-- Run in Supabase Dashboard → SQL Editor. Idempotent: running it twice is safe.
-- Requires 001, 002 and 003 to have run first.
--
-- WHAT THIS IMPLEMENTS
-- --------------------
-- Darren's FINANCIAL FLOW CHART describes three spreadsheets that send data to
-- each other:
--
--   Step 1  Customer Repository → Quote Estimator   (customer identity)
--   Step 2  Quote Estimator → Customer Repository   (price + won/pending/lost)
--           Quote Estimator → Finance Tracker       (revenue + CSL costs)
--   Step 3  Customer Repository records both        (from the Quote Estimator)
--
-- None of those steps exist here, because nothing is copied. A customer is
-- stored once; a quote references it; a job references the quote; a cost
-- references the job. His three arrows are foreign keys. The arrows exist in
-- his diagram only because Google Sheets cannot say "this row belongs to that
-- customer."
--
-- THE ONE DECISION WORTH READING BEFORE THE SQL
-- ---------------------------------------------
-- quotes.rate_snapshot freezes the rate card in force when the quote was
-- calculated. When a rate changes in November, October's won quotes must not
-- silently reprice. A spreadsheet reprices the entire column the moment you
-- edit the rate cell — that is how a P&L becomes untrustworthy without anyone
-- doing anything wrong. One JSONB column is the difference between a record
-- and a recalculation.
-- ===========================================================================


-- ===========================================================================
-- SECTION 0 — Finance tables, created defensively
-- ---------------------------------------------------------------------------
-- lib/finance/queries.ts reads finance_entries, finance_categories,
-- finance_field_defs and finance_monthly_pl. No migration in the repo creates
-- them (001 creates expense_categories / expense_entries, which nothing reads).
-- Either the SQL was run by hand and never committed, or /portal/finance is
-- currently showing "Finance database not connected".
--
-- These CREATE IF NOT EXISTS statements match the shape documented in
-- lib/finance/types.ts. If the tables already exist these are no-ops.
--
-- ⚠  If they exist with a DIFFERENT shape, IF NOT EXISTS silently skips and the
--    mismatch survives. Verify with:
--      select table_name, column_name, data_type
--      from information_schema.columns
--      where table_schema = 'public' and table_name like 'finance_%'
--      order by table_name, ordinal_position;
-- ===========================================================================

create table if not exists public.finance_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        text not null check (kind in ('expense', 'income')),
  sort_order  int  not null default 0,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (name, kind)
);

create table if not exists public.finance_field_defs (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  label       text not null,
  field_type  text not null check (field_type in ('text','number','currency','date','select','boolean')),
  options     jsonb,
  required    boolean not null default false,
  applies_to  text not null default 'both' check (applies_to in ('expense','income','both')),
  sort_order  int  not null default 0,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.finance_entries (
  id             uuid primary key default gen_random_uuid(),
  entry_date     date not null,
  kind           text not null check (kind in ('expense', 'income')),
  category_id    uuid references public.finance_categories (id) on delete set null,
  description    text not null default '',
  amount         numeric(12, 2) not null default 0 check (amount >= 0),
  -- Opportunities live in the repo's typed data layer, not in Postgres, so this
  -- is text ('OPP-2026-044') rather than a foreign key — same reasoning as
  -- record_notes.subject_id in migration 002.
  opportunity_id text,
  custom_fields  jsonb not null default '{}'::jsonb,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references auth.users (id) on delete set null
);

alter table public.finance_categories  enable row level security;
alter table public.finance_field_defs  enable row level security;
alter table public.finance_entries     enable row level security;


-- ===========================================================================
-- SECTION 1 — Reference data: rates, surcharges, dropdown vocabularies
-- ---------------------------------------------------------------------------
-- Darren maintains a rate matrix in BOTH spreadsheets and the Quote Calculator
-- uses neither — it hardcodes $1.70/mi and $15/stop while both matrices say
-- $1.65 / $1.40 / $1.90 and $15 / $10 / $25. GEN (General Delivery) exists in
-- the Customer Repository matrix and on its dashboard, but is not selectable in
-- the estimator at all.
--
-- One table. Seeded from the Customer Repository version because it is the
-- complete one. Editable from Settings, so correcting a rate is never a
-- migration.
-- ===========================================================================

create table if not exists public.service_rates (
  service_code    text primary key check (service_code in ('ODC', 'SDR', 'STAT', 'GEN')),
  service_name    text not null,
  base_pickup_fee numeric(10, 2) not null check (base_pickup_fee >= 0),
  per_mile_rate   numeric(10, 4) not null check (per_mile_rate   >= 0),
  per_stop_fee    numeric(10, 2) not null check (per_stop_fee    >= 0),
  is_quotable     boolean not null default true,
  sort_order      int not null default 0,
  updated_at      timestamptz not null default now()
);

insert into public.service_rates
  (service_code, service_name, base_pickup_fee, per_mile_rate, per_stop_fee, sort_order) values
  ('STAT', 'Super STAT Emergency', 65.00, 1.90, 25.00, 1),
  ('ODC',  'On Demand Call',       45.00, 1.65, 15.00, 2),
  ('SDR',  'Scheduled & Dedicated',30.00, 1.40, 10.00, 3),
  ('GEN',  'General Delivery',     35.00, 1.50, 12.00, 4)
on conflict (service_code) do nothing;

-- Scalar surcharges and thresholds. Key/value so a new surcharge is an insert,
-- not a migration.
create table if not exists public.rate_settings (
  key        text primary key,
  label      text not null,
  value      numeric(12, 4) not null,
  unit       text not null default 'usd' check (unit in ('usd', 'usd_per_mile', 'usd_per_minute', 'miles', 'minutes', 'percent')),
  note       text,
  updated_at timestamptz not null default now()
);

insert into public.rate_settings (key, label, value, unit, note) values
  ('cold_chain_surcharge',     'Cold-Chain / Temp Control Surcharge', 35.00, 'usd',            'Flat surcharge when temperature control is required'),
  ('off_hours_surcharge',      'Off-Hours / Weekend / Holiday',       25.00, 'usd',            'Merges the estimator''s two separate $25 charges — Off-Hours and Holiday/Weekend — into one'),
  ('excess_mileage_threshold', 'Excess Mileage Threshold',           100.00, 'miles',          'Round-trip miles above which the excess rate applies'),
  ('excess_mileage_rate',      'Excess Mileage Rate',                  2.25, 'usd_per_mile',   'Applies only to miles beyond the threshold'),
  ('wait_time_per_minute',     'Wait-Time Billing',                    1.75, 'usd_per_minute', 'After the grace window'),
  ('wait_time_grace_minutes',  'Wait-Time Grace Window',              15.00, 'minutes',        'Darren''s sheet says "10-15 minutes" — 15 chosen, confirm'),
  ('late_cancellation_fee',    'Late Cancellation',                   35.00, 'usd',            'Post-hoc: charged on the job, not quoted'),
  ('no_show_fee',              'No-Show / At-Door Cancel',            50.00, 'usd',            'Post-hoc: $50 or full base fare, whichever is greater'),
  ('return_trip_pct',          'Return-Trip Fee',                      0.20, 'percent',        'Post-hoc: 20% of outbound fare')
on conflict (key) do nothing;

-- Every dropdown from the Lookup Tables tab, in one table.
--
-- His lookup offers exactly three delivery statuses (Picked Up / In Transit /
-- Delivered) while his live rows already use "Delayed" and "On Hold". The seed
-- below is the superset of both, so the vocabulary starts out matching reality.
create table if not exists public.lookup_values (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,
  value       text not null,
  label       text not null,
  sort_order  int  not null default 0,
  is_archived boolean not null default false,
  unique (kind, value)
);

insert into public.lookup_values (kind, value, label, sort_order) values
  ('delivery_type', 'Medical',       'Medical',       1),
  ('delivery_type', 'Veterinarian',  'Veterinarian',  2),
  ('delivery_type', 'Commercial',    'Commercial',    3),
  ('delivery_type', 'Warehouse',     'Warehouse',     4),
  ('delivery_type', 'Private',       'Private',       5),

  ('delay_reason',  'None',          'None',          1),
  ('delay_reason',  'Traffic',       'Traffic',       2),
  ('delay_reason',  'Accident',      'Accident',      3),
  ('delay_reason',  'Breakdown',     'Breakdown',     4),
  ('delay_reason',  'Fuel Stop',     'Fuel Stop',     5),
  ('delay_reason',  'Repair',        'Repair',        6),
  ('delay_reason',  'Other',         'Other',         7),

  ('fuel_type',     'Gas',           'Gas',           1),
  ('fuel_type',     'Electric',      'Electric',      2),

  ('vehicle_type',  'Ford Transit Connect XLT', 'Ford Transit Connect XLT', 1),
  ('vehicle_type',  'Other',                    'Other',                    2),

  ('hazard_class',  'Class 6.2 (Infectious Substances)',      'Class 6.2 — Infectious Substances',   1),
  ('hazard_class',  'Class 6.1 (Toxic/Poisonous Substances)', 'Class 6.1 — Toxic / Poisonous',       2),
  ('hazard_class',  'Class 3 (Flammable Liquids)',            'Class 3 — Flammable Liquids',         3),
  ('hazard_class',  'Class 8 (Corrosive Materials)',          'Class 8 — Corrosive Materials',       4),
  ('hazard_class',  'Class 9 (Miscellaneous)',                'Class 9 — Miscellaneous',             5),
  ('hazard_class',  'Other',                                  'Other',                               6),

  ('time_slot',     '06:00 - 08:00', '06:00 – 08:00', 1),
  ('time_slot',     '08:00 - 10:00', '08:00 – 10:00', 2),
  ('time_slot',     '10:00 - 12:00', '10:00 – 12:00', 3),
  ('time_slot',     '12:00 - 14:00', '12:00 – 14:00', 4),
  ('time_slot',     '14:00 - 16:00', '14:00 – 16:00', 5),
  ('time_slot',     '16:00 - 18:00', '16:00 – 18:00', 6),
  ('time_slot',     '18:00 - 20:00', '18:00 – 20:00', 7),
  ('time_slot',     '20:00 - 22:00', '20:00 – 22:00', 8),
  ('time_slot',     'Night / On-Call','Night / On-Call', 9)
on conflict (kind, value) do nothing;

alter table public.service_rates  enable row level security;
alter table public.rate_settings  enable row level security;
alter table public.lookup_values  enable row level security;


-- ===========================================================================
-- SECTION 2 — Fleet
-- ---------------------------------------------------------------------------
-- His sheet has "Vehicle ID (1-10)" pre-seeded to ten vehicles. CSL runs one
-- 2019 Ford Transit today. Vehicles are rows, added when they are bought.
-- ===========================================================================

create table if not exists public.vehicles (
  id           uuid primary key default gen_random_uuid(),
  label        text not null unique,
  vehicle_type text,
  fuel_type    text not null default 'Gas' check (fuel_type in ('Gas', 'Electric')),
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

insert into public.vehicles (label, vehicle_type, fuel_type, sort_order) values
  ('Vehicle #1', 'Ford Transit Connect XLT', 'Gas', 1)
on conflict (label) do nothing;

alter table public.vehicles enable row level security;


-- ===========================================================================
-- SECTION 3 — Customers
-- ---------------------------------------------------------------------------
-- The correction that matters most.
--
-- His Customer Repository's first column is "Customer UID" and its values are
-- RT-2026-001, RT-2026-002, RT-2026-003 — those are ROUTES. Customer name,
-- address, phone and email are re-typed on every route row. Right now VCU
-- Health appears once; at 40 runs a week it appears 40 times and the 41st has a
-- typo in the email.
--
-- Step 1 of the flow chart ("send Customer UID, Name, Address, Phone, Email to
-- the Quote Estimator") exists as a step only because the customer is not
-- stored anywhere durable. Here it is a dropdown.
-- ===========================================================================

create sequence if not exists public.customer_uid_seq start 1;

create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  uid           text not null unique
                default ('CUST-' || lpad(nextval('public.customer_uid_seq')::text, 4, '0')),
  name          text not null check (char_length(name) between 1 and 200),
  address       text,
  phone         text,
  email         text,
  delivery_type text,
  notes         text,
  is_archived   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references auth.users (id) on delete set null
);

create index if not exists customers_name_idx on public.customers (lower(name));
alter table public.customers enable row level security;


-- ===========================================================================
-- SECTION 4 — Quotes
-- ---------------------------------------------------------------------------
-- Inputs, a frozen rate snapshot, the computed line items, and the outcome.
--
-- Status vocabulary: Darren asked for Won / Pending / Lost. Draft and Sent are
-- added because a quote exists before it is sent, and he already cares about
-- that distinction — "Awaiting Darren's approval — not sent" is the chip he
-- circled on the outreach drafts in migration 003.
--
-- Status is a column here, not a row in record_status. Same reasoning as 003:
-- an opportunity's stage lives only in pipeline_state because the board and the
-- dropdown are the same fact. Storing a fact twice is how two screens end up
-- disagreeing with nobody able to say which is right.
-- ===========================================================================

create sequence if not exists public.quote_uid_seq start 1;

create table if not exists public.quotes (
  id           uuid primary key default gen_random_uuid(),
  uid          text not null unique
               default ('Q-' || to_char(now(), 'YYYY') || '-' ||
                        lpad(nextval('public.quote_uid_seq')::text, 3, '0')),
  customer_id  uuid not null references public.customers (id) on delete restrict,

  -- ── Inputs (mirror the Quote Calculator tab one for one) ────────────────
  service_code   text not null references public.service_rates (service_code),
  stops          int  not null default 1 check (stops between 1 and 20),
  route_miles    numeric(10, 2) not null default 0 check (route_miles >= 0),
  extra_miles    numeric(10, 2) not null default 0 check (extra_miles >= 0),
  tolls_parking  numeric(10, 2) not null default 0 check (tolls_parking >= 0),
  cold_chain     boolean not null default false,
  off_hours      boolean not null default false,
  wait_minutes   int not null default 0 check (wait_minutes >= 0),
  -- −0.15 … +0.15 in 0.05 steps, stored as a fraction not a percent
  adjustment_pct numeric(5, 4) not null default 0
                 check (adjustment_pct between -0.15 and 0.15),

  -- ── Frozen at calculation time. See the header note. ────────────────────
  -- { rate: {...one service_rates row...}, settings: {key: value, ...} }
  rate_snapshot jsonb not null,

  -- ── Computed and stored, so a quote reads back byte-identical ───────────
  -- [{ key, label, basis, amount }, ...] — the "Detailed Cost Breakdown" table
  line_items        jsonb not null default '[]'::jsonb,
  service_subtotal  numeric(12, 2) not null default 0,
  adjustment_amount numeric(12, 2) not null default 0,
  total             numeric(12, 2) not null default 0,

  -- ── Outcome ─────────────────────────────────────────────────────────────
  status      text not null default 'Draft'
              check (status in ('Draft', 'Sent', 'Pending', 'Won', 'Lost')),
  quoted_on   date not null default current_date,
  decided_on  date,
  notes       text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id) on delete set null
);

create index if not exists quotes_customer_idx on public.quotes (customer_id);
create index if not exists quotes_status_idx   on public.quotes (status);
create index if not exists quotes_quoted_on_idx on public.quotes (quoted_on desc);
alter table public.quotes enable row level security;


-- ===========================================================================
-- SECTION 5 — Jobs
-- ---------------------------------------------------------------------------
-- What his CLIENT REPOSITORY tab actually is: one row per run. 54 columns
-- there; here the customer columns are gone (they are a foreign key) and the
-- nine expense columns are gone (they are finance_entries — see Section 6).
--
-- The uid keeps his RT-2026-001 format so existing paperwork still matches.
--
-- Fuel cost is COMPUTED from gallons × price, never typed. In his sheet
-- "Total Fuel Cost ($)" is identical to "Cost ($) to Client" on all three live
-- rows ($13.45 / $33.45 / $25.45) and matches gallons × price on none of them —
-- two different columns wired to the same broken formula. Revenue equal to fuel
-- cost is why the dashboard's Net Profit Margin reads #REF!.
-- ===========================================================================

create sequence if not exists public.job_uid_seq start 1;

create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  uid         text not null unique
              default ('RT-' || to_char(now(), 'YYYY') || '-' ||
                       lpad(nextval('public.job_uid_seq')::text, 3, '0')),
  customer_id uuid not null references public.customers (id) on delete restrict,
  -- Nullable: an urgent run can be dispatched without a quote. The UI flags it.
  quote_id    uuid references public.quotes (id) on delete set null,

  -- ── Service ─────────────────────────────────────────────────────────────
  delivery_type   text,
  service_code    text not null references public.service_rates (service_code),
  delivery_status text not null default 'Scheduled'
                  check (delivery_status in ('Scheduled', 'Picked Up', 'In Transit',
                                             'Delivered', 'Delayed', 'On Hold', 'Cancelled')),
  delay_reason    text,
  delay_notes     text,
  delivery_notes  text,

  -- ── Schedule ────────────────────────────────────────────────────────────
  pickup_date      date,
  pickup_time      time,
  pickup_location  text,
  dropoff_date     date,
  dropoff_time     time,
  dropoff_location text,
  recipient_names  text,
  time_slot        text,

  -- ── Revenue ─────────────────────────────────────────────────────────────
  -- Defaults from the accepted quote's total; editable, with the UI showing the
  -- variance against the quote rather than hiding it.
  billed_amount numeric(12, 2) check (billed_amount is null or billed_amount >= 0),

  -- ── Route & vehicle ─────────────────────────────────────────────────────
  vehicle_id      uuid references public.vehicles (id) on delete set null,
  odometer_start  int check (odometer_start is null or odometer_start >= 0),
  odometer_end    int check (odometer_end   is null or odometer_end   >= 0),
  total_miles     numeric(10, 2) check (total_miles is null or total_miles >= 0),

  -- ── Fuel for this run (a tank spanning several runs goes in fuel_purchases) ─
  fuel_gallons    numeric(10, 2) check (fuel_gallons is null or fuel_gallons >= 0),
  cost_per_gallon numeric(10, 3) check (cost_per_gallon is null or cost_per_gallon >= 0),
  fuel_cost       numeric(12, 2)
                  generated always as (
                    round(coalesce(fuel_gallons, 0) * coalesce(cost_per_gallon, 0), 2)
                  ) stored,

  -- ── Cold chain ──────────────────────────────────────────────────────────
  cold_chain_logged boolean not null default false,
  pickup_temp_f     numeric(5, 1),
  dropoff_temp_f    numeric(5, 1),

  -- ── Chain of custody ────────────────────────────────────────────────────
  coc_required        boolean not null default false,
  coc_number          text,
  coc_pickup_person   text,
  coc_pickup_at       timestamptz,
  coc_pickup_location text,
  coc_handoff_person  text,
  coc_handoff_at      timestamptz,
  coc_handoff_location text,
  hazard_class        text,
  hazard_class_other  text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,

  constraint jobs_odometer_order
    check (odometer_start is null or odometer_end is null or odometer_end >= odometer_start)
);

create index if not exists jobs_customer_idx on public.jobs (customer_id);
create index if not exists jobs_quote_idx    on public.jobs (quote_id);
create index if not exists jobs_status_idx   on public.jobs (delivery_status);
create index if not exists jobs_pickup_idx   on public.jobs (pickup_date desc);
-- Partial unique: a quote converts to at most one job. Recurring work creates
-- separate quotes rather than silently reusing one.
create unique index if not exists jobs_one_per_quote_idx
  on public.jobs (quote_id) where quote_id is not null;

alter table public.jobs enable row level security;


-- ===========================================================================
-- SECTION 6 — Wiring the finance tracker to customers, quotes and jobs
-- ---------------------------------------------------------------------------
-- Step 2 of the flow chart ("send Cost to CSL to FINANCE") needs no code. A
-- cost logged against a job IS a finance-tracker row, because it is written
-- into the table the finance tracker already reads.
--
-- His Route Dispatch Form has nine fixed expense fields (Maintenance, Oil &
-- Fluids, Tire Rotation, Tolls-Fix, Tolls-Replace, Parking, Engine Service,
-- Tire Repair, Vehicle Damage) plus a tenth that sums them and currently reads
-- #REF!. Nine columns means the tenth cost type is a migration. Rows mean it is
-- a dropdown value.
-- ===========================================================================

alter table public.finance_entries
  add column if not exists job_id      uuid references public.jobs      (id) on delete set null,
  add column if not exists customer_id uuid references public.customers (id) on delete set null,
  add column if not exists quote_id    uuid references public.quotes    (id) on delete set null,
  -- Fixed overhead (insurance, subscriptions, phone) is real money but is not
  -- attributable to any one run. Job margin excludes it; net profit includes it.
  -- Two numbers, both labelled, neither pretending to be the other.
  add column if not exists is_overhead boolean not null default false;

create index if not exists finance_entries_job_idx      on public.finance_entries (job_id);
create index if not exists finance_entries_customer_idx on public.finance_entries (customer_id);
create index if not exists finance_entries_date_idx     on public.finance_entries (entry_date desc);

-- Categories: Darren's own P&L list from migration 001, plus the per-job cost
-- types from his dispatch form. Insurance is seeded as overhead.
insert into public.finance_categories (name, kind, sort_order) values
  ('Fuel',                  'expense',  1),
  ('Tolls',                 'expense',  2),
  ('Parking',               'expense',  3),
  ('Vehicle Maintenance',   'expense',  4),
  ('Oil & Fluids',          'expense',  5),
  ('Tire Rotation',         'expense',  6),
  ('Tire Repair',           'expense',  7),
  ('Engine Service',        'expense',  8),
  ('Vehicle Damage',        'expense',  9),
  ('Commercial Insurance',  'expense', 10),
  ('Cargo Insurance',       'expense', 11),
  ('Services & Subscriptions','expense',12),
  ('Card Purchases',        'expense', 13),
  ('Mileage Reimbursement', 'expense', 14),
  ('Misc.',                 'expense', 15),
  ('Delivery Revenue',      'income',   1),
  ('Other Income',          'income',   2)
on conflict (name, kind) do nothing;


-- ===========================================================================
-- SECTION 7 — Fuel log
-- ---------------------------------------------------------------------------
-- The Estimator's "Mileage & Fuel Tracker" tab. It is per VEHICLE and per DATE,
-- not per route, because a tank of gas covers several runs.
--
-- That tab logs 580 miles; the Client Repository logs 185.5 miles of routes.
-- Two unreconciled mileage sources. Here, route miles live on jobs, fuel
-- purchases live here, and cost-per-mile is derived from both rather than
-- typed into either.
-- ===========================================================================

create table if not exists public.fuel_purchases (
  id              uuid primary key default gen_random_uuid(),
  purchased_at    timestamptz not null default now(),
  vehicle_id      uuid references public.vehicles (id) on delete set null,
  vendor          text,
  location        text,
  gallons         numeric(10, 2) not null default 0 check (gallons >= 0),
  amount_paid     numeric(12, 2) not null default 0 check (amount_paid >= 0),
  price_per_gallon numeric(10, 3)
                  generated always as (
                    case when gallons > 0 then round(amount_paid / gallons, 3) else null end
                  ) stored,
  odometer        int,
  driver          text,
  -- Optional link to the finance entry this purchase created, so the fuel log
  -- and the P&L cannot double-count the same $41.09.
  finance_entry_id uuid references public.finance_entries (id) on delete set null,
  created_at      timestamptz not null default now(),
  created_by      uuid references auth.users (id) on delete set null
);

create index if not exists fuel_purchases_date_idx on public.fuel_purchases (purchased_at desc);
alter table public.fuel_purchases enable row level security;


-- ===========================================================================
-- SECTION 8 — Views
-- ---------------------------------------------------------------------------
-- Steps 2 and 3 of the flow chart, expressed as queries instead of copies.
-- ===========================================================================

-- ── The ledger: job revenue ∪ manual finance entries ───────────────────────
-- Revenue is NOT duplicated into finance_entries. A copy drifts the first time
-- someone edits the job and forgets the entry.
create or replace view public.finance_ledger as
  select
    e.id,
    e.entry_date,
    e.kind,
    e.category_id,
    coalesce(c.name, 'Uncategorised') as category_name,
    e.description,
    e.amount,
    e.customer_id,
    e.job_id,
    e.quote_id,
    e.is_overhead,
    'entry'::text as source
  from public.finance_entries e
  left join public.finance_categories c on c.id = e.category_id

  union all

  select
    j.id,
    coalesce(j.dropoff_date, j.pickup_date) as entry_date,
    'income'::text  as kind,
    null::uuid      as category_id,
    'Delivery Revenue'::text as category_name,
    j.uid || ' — ' || cu.name as description,
    j.billed_amount as amount,
    j.customer_id,
    j.id            as job_id,
    j.quote_id,
    false           as is_overhead,
    'job'::text     as source
  from public.jobs j
  join public.customers cu on cu.id = j.customer_id
  where j.delivery_status = 'Delivered'
    and j.billed_amount is not null
    and j.billed_amount > 0
    and coalesce(j.dropoff_date, j.pickup_date) is not null;

-- ── Monthly P&L, redefined over the ledger ─────────────────────────────────
-- Same four columns lib/finance/queries.ts already selects (month, income,
-- expenses, net), so getMonthlyPL() does not change. Dropped rather than
-- replaced because CREATE OR REPLACE VIEW cannot change a column's type.
drop view if exists public.finance_monthly_pl;
create view public.finance_monthly_pl as
  select
    date_trunc('month', entry_date)::date as month,
    coalesce(sum(amount) filter (where kind = 'income'),  0)::numeric(14, 2) as income,
    coalesce(sum(amount) filter (where kind = 'expense'), 0)::numeric(14, 2) as expenses,
    ( coalesce(sum(amount) filter (where kind = 'income'),  0)
    - coalesce(sum(amount) filter (where kind = 'expense'), 0))::numeric(14, 2) as net
  from public.finance_ledger
  where entry_date is not null
  group by 1;

-- ── Per-job economics ──────────────────────────────────────────────────────
create or replace view public.job_financials as
  select
    j.id          as job_id,
    j.uid,
    j.customer_id,
    j.quote_id,
    j.service_code,
    j.delivery_status,
    coalesce(j.dropoff_date, j.pickup_date) as job_date,
    coalesce(j.billed_amount, 0)::numeric(14, 2) as revenue,
    q.total       as quoted_total,
    (coalesce(j.billed_amount, 0) - coalesce(q.total, 0))::numeric(14, 2) as billed_vs_quoted,
    coalesce(j.fuel_cost, 0)::numeric(14, 2) as fuel_cost,
    ( select coalesce(sum(e.amount), 0)
      from public.finance_entries e
      where e.job_id = j.id and e.kind = 'expense' and e.is_overhead = false
    )::numeric(14, 2) as attributed_cost,
    ( coalesce(j.billed_amount, 0)
      - coalesce(j.fuel_cost, 0)
      - ( select coalesce(sum(e.amount), 0)
          from public.finance_entries e
          where e.job_id = j.id and e.kind = 'expense' and e.is_overhead = false )
    )::numeric(14, 2) as job_margin,
    j.total_miles
  from public.jobs j
  left join public.quotes q on q.id = j.quote_id;

-- ── Step 3 of the flow chart, as a query ───────────────────────────────────
create or replace view public.customer_summary as
  with base as (
    select
      c.id   as customer_id,
      c.uid,
      c.name,
      c.phone,
      c.email,
      c.delivery_type,
      c.is_archived,
      (select count(*) from public.quotes q where q.customer_id = c.id) as quotes_total,
      (select count(*) from public.quotes q where q.customer_id = c.id and q.status = 'Won')  as quotes_won,
      (select count(*) from public.quotes q where q.customer_id = c.id and q.status = 'Lost') as quotes_lost,
      (select count(*) from public.quotes q where q.customer_id = c.id
         and q.status in ('Draft', 'Sent', 'Pending')) as quotes_open,
      (select coalesce(sum(q.total), 0) from public.quotes q
         where q.customer_id = c.id and q.status = 'Won')::numeric(14, 2) as won_quote_value,
      (select count(*) from public.jobs j where j.customer_id = c.id) as jobs_total,
      (select count(*) from public.jobs j where j.customer_id = c.id
         and j.delivery_status = 'Delivered') as jobs_delivered,
      (select coalesce(sum(f.revenue), 0) from public.job_financials f
         where f.customer_id = c.id)::numeric(14, 2) as revenue,
      (select coalesce(sum(f.fuel_cost + f.attributed_cost), 0) from public.job_financials f
         where f.customer_id = c.id)::numeric(14, 2) as cost_to_csl,
      (select coalesce(sum(j.total_miles), 0) from public.jobs j
         where j.customer_id = c.id)::numeric(12, 1) as miles,
      (select max(coalesce(j.dropoff_date, j.pickup_date)) from public.jobs j
         where j.customer_id = c.id) as last_job_date
    from public.customers c
  )
  select
    base.*,
    (revenue - cost_to_csl)::numeric(14, 2) as job_margin,
    case when quotes_won + quotes_lost > 0
         then round(quotes_won::numeric * 100 / (quotes_won + quotes_lost), 1)
         else null end as win_rate_pct
  from base;

-- ── The Dashboard's service-level breakdown ────────────────────────────────
create or replace view public.service_level_summary as
  select
    r.service_code,
    r.service_name,
    r.sort_order,
    count(j.id)                                                 as run_count,
    count(j.id) filter (where j.delivery_status = 'Delivered')  as delivered_count,
    coalesce(sum(j.billed_amount) filter
      (where j.delivery_status = 'Delivered'), 0)::numeric(14, 2) as revenue,
    case
      when count(j.id) filter (where j.delivery_status = 'Delivered') > 0
      then round(
             coalesce(sum(j.billed_amount) filter (where j.delivery_status = 'Delivered'), 0)
             / count(j.id) filter (where j.delivery_status = 'Delivered'), 2)
      else 0::numeric
    end                                                         as avg_revenue_per_run,
    coalesce(sum(j.total_miles), 0)::numeric(12, 1)             as miles
  from public.service_rates r
  left join public.jobs j on j.service_code = r.service_code
  group by r.service_code, r.service_name, r.sort_order;


-- ===========================================================================
-- SECTION 9 — Row level security
-- ---------------------------------------------------------------------------
-- Same rule as 001/002/003: anyone with a profile is a portal user, and these
-- are shared business facts. Not per-user data.
-- ===========================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'finance_categories', 'finance_field_defs', 'finance_entries',
    'service_rates', 'rate_settings', 'lookup_values',
    'vehicles', 'customers', 'quotes', 'jobs', 'fuel_purchases'
  ] loop
    execute format('drop policy if exists "Portal users manage %1$s" on public.%1$I', t);
    execute format(
      'create policy "Portal users manage %1$s" on public.%1$I for all '
      'using (exists (select 1 from public.profiles where id = auth.uid())) '
      'with check (exists (select 1 from public.profiles where id = auth.uid()))', t);
  end loop;
end
$$;

-- Views run with the definer's rights by default, which would bypass the
-- policies above. security_invoker makes them honour the caller's RLS.
-- Wrapped because it requires PostgreSQL 15+.
do $$
declare v text;
begin
  foreach v in array array[
    'finance_ledger', 'finance_monthly_pl', 'job_financials',
    'customer_summary', 'service_level_summary'
  ] loop
    begin
      execute format('alter view public.%I set (security_invoker = on)', v);
    exception when others then null;
    end;
  end loop;
end
$$;

revoke all on public.finance_ledger, public.finance_monthly_pl, public.job_financials,
               public.customer_summary, public.service_level_summary
  from anon;


-- ===========================================================================
-- SECTION 10 — updated_at triggers
-- ---------------------------------------------------------------------------
-- public.set_updated_at() already exists from migration 001.
-- ===========================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'finance_categories', 'finance_field_defs', 'finance_entries',
    'service_rates', 'rate_settings', 'customers', 'quotes', 'jobs'
  ] loop
    execute format('drop trigger if exists %1$s_updated_at on public.%1$I', t);
    execute format(
      'create trigger %1$s_updated_at before update on public.%1$I '
      'for each row execute function public.set_updated_at()', t);
  end loop;
end
$$;


-- ===========================================================================
-- SECTION 11 — Realtime (optional)
-- ---------------------------------------------------------------------------
-- So a quote Darren marks Won on his phone updates on another screen without a
-- refresh. Wrapped so the migration still succeeds where the publication does
-- not exist.
-- ===========================================================================

do $$
declare t text;
begin
  foreach t in array array['customers', 'quotes', 'jobs', 'finance_entries'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null;
      when undefined_object then null;
    end;
  end loop;
end
$$;
