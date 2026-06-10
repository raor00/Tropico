-- AML velocity ledger — server-side accumulator for daily/monthly limits.
-- Run via: supabase db push  OR  psql $DATABASE_URL -f this file
--
-- Required env vars in production:
--   SUPABASE_URL         — project URL, e.g. https://xyzxyz.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY — service-role JWT (bypasses RLS)

create table if not exists aml_ledger (
  wallet       text        not null,
  -- For daily rows: the calendar day (UTC).  For monthly rows: first day of the month (UTC).
  period_start date        not null,
  period_type  text        not null check (period_type in ('daily', 'monthly')),
  total_usd    numeric(18, 6) not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (wallet, period_start, period_type)
);

-- Index to support fast look-ups by wallet + period
create index if not exists aml_ledger_wallet_period
  on aml_ledger (wallet, period_start, period_type);

-- RLS: service-role key bypasses all policies.
-- Enable RLS so the table is not publicly readable via anon key.
alter table aml_ledger enable row level security;

-- No public access — only service role can read/write.
-- (Add more permissive policies if you need authenticated user reads.)
