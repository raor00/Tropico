-- Atomic AML record-and-check RPC.
-- Replaces the non-atomic SELECT → check → UPSERT pattern in lib/aml-server.ts
-- with a single transaction that holds row-level locks (SELECT … FOR UPDATE),
-- preventing TOCTOU race conditions on concurrent checkout requests.
--
-- Apply with: supabase db push
--   OR: psql $DATABASE_URL -f supabase/migrations/0003_aml_check_rpc.sql
--
-- Depends on: 0002_aml_ledger.sql  (aml_ledger table must exist)

create or replace function aml_record_and_check(
  p_wallet        text,
  p_amount        numeric,
  p_daily_limit   numeric,
  p_monthly_limit numeric,
  p_per_tx_limit  numeric
)
returns table(
  allowed       boolean,
  reason        text,
  daily_total   numeric,
  monthly_total numeric
)
language plpgsql
security definer
-- search_path is pinned to prevent search_path injection attacks
set search_path = public
as $$
declare
  v_today         date    := current_date;
  v_month_start   date    := date_trunc('month', current_date)::date;
  v_daily_total   numeric := 0;
  v_monthly_total numeric := 0;
begin
  -- 1. Per-transaction limit (no DB access needed).
  if p_amount > p_per_tx_limit then
    return query select
      false,
      format(
        'Exceeds per-transaction limit of $%s.',
        to_char(p_per_tx_limit, 'FM999,999,999')
      ),
      0::numeric,
      0::numeric;
    return;
  end if;

  -- 2. Ensure both ledger rows exist before locking.
  --    INSERT … ON CONFLICT DO NOTHING is safe under concurrent load:
  --    exactly one concurrent writer will insert; others skip silently.
  insert into aml_ledger (wallet, period_start, period_type, total_usd, updated_at)
    values (p_wallet, v_today, 'daily', 0, now())
    on conflict (wallet, period_start, period_type) do nothing;

  insert into aml_ledger (wallet, period_start, period_type, total_usd, updated_at)
    values (p_wallet, v_month_start, 'monthly', 0, now())
    on conflict (wallet, period_start, period_type) do nothing;

  -- 3. Acquire row-level locks in a consistent order (daily then monthly)
  --    to avoid deadlocks between concurrent callers.
  select total_usd into v_daily_total
    from aml_ledger
    where wallet = p_wallet
      and period_start = v_today
      and period_type  = 'daily'
    for update;

  select total_usd into v_monthly_total
    from aml_ledger
    where wallet = p_wallet
      and period_start = v_month_start
      and period_type  = 'monthly'
    for update;

  -- 4. Daily limit check.
  if (v_daily_total + p_amount) > p_daily_limit then
    return query select
      false,
      format(
        'Exceeds daily limit of $%s. Up to $%s remaining today.',
        to_char(p_daily_limit,                              'FM999,999,999'),
        to_char(greatest(0, p_daily_limit - v_daily_total), 'FM999,999,999')
      ),
      v_daily_total,
      v_monthly_total;
    return;
  end if;

  -- 5. Monthly limit check.
  if (v_monthly_total + p_amount) > p_monthly_limit then
    return query select
      false,
      format(
        'Exceeds monthly limit of $%s. Up to $%s remaining this month.',
        to_char(p_monthly_limit,                                'FM999,999,999'),
        to_char(greatest(0, p_monthly_limit - v_monthly_total), 'FM999,999,999')
      ),
      v_daily_total,
      v_monthly_total;
    return;
  end if;

  -- 6. All checks passed — increment both rows atomically while locks are held.
  update aml_ledger
    set total_usd  = total_usd + p_amount,
        updated_at = now()
    where wallet = p_wallet
      and period_start = v_today
      and period_type  = 'daily';

  update aml_ledger
    set total_usd  = total_usd + p_amount,
        updated_at = now()
    where wallet = p_wallet
      and period_start = v_month_start
      and period_type  = 'monthly';

  return query select
    true,
    null::text,
    v_daily_total   + p_amount,
    v_monthly_total + p_amount;
end;
$$;

-- Revoke direct execution from anon / authenticated roles.
-- Only the service-role (used by aml-server.ts) may call this function.
revoke execute on function aml_record_and_check(text, numeric, numeric, numeric, numeric)
  from public, anon, authenticated;
