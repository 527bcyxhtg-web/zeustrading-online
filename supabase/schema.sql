-- Optional Supabase mirror for Zeus Trading.
-- Cloudflare D1 is the active production store today. Use this if you want a Supabase analytics mirror later.

create table if not exists public.zt_agent_run_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  run_id text not null,
  final_decision text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zt_wallet_clob_previews (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  venue text not null default 'polymarket-clob',
  wallet_provider text not null,
  token_id text not null,
  side text not null,
  outcome text not null,
  price numeric not null,
  size numeric not null,
  notional numeric not null,
  status text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zt_compliance_checks (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  country text,
  blocked boolean not null,
  reason text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zt_wallet_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  wallet_address text,
  message text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zt_wallet_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  wallet_address text not null,
  wallet_provider text not null,
  challenge_id text not null,
  signature text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zt_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.zt_agent_run_logs enable row level security;
alter table public.zt_wallet_clob_previews enable row level security;
alter table public.zt_compliance_checks enable row level security;
alter table public.zt_wallet_challenges enable row level security;
alter table public.zt_wallet_approvals enable row level security;
alter table public.zt_journal_entries enable row level security;
