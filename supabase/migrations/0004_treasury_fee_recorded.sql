-- Treasury fee idempotency guard.
-- Prevents the same on-chain realestate tx from being double-recorded in
-- tropico_treasury. The route inserts the tx signature before calling
-- record_fee; ON CONFLICT DO NOTHING means a second POST for the same
-- signature returns {status:"already_recorded"} without re-recording.
--
-- Apply with: supabase db push
--   OR: psql $DATABASE_URL -f supabase/migrations/0004_treasury_fee_recorded.sql
--
-- Depends on: nothing (standalone table)

create table if not exists treasury_fee_recorded (
  signature   text        primary key,
  recorded_at timestamptz not null default now()
);

-- RLS: service-role key bypasses all policies.
-- Enable RLS so the table is not readable via the anon/authenticated roles.
alter table treasury_fee_recorded enable row level security;

-- No public access — only the service role (used by record-fee route) may write.
revoke all on table treasury_fee_recorded from anon, authenticated;
