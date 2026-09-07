create table if not exists public.messenger_identities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  provider text not null check (provider in ('telegram', 'max')),
  provider_user_id bigint not null,
  chat_id bigint,
  username text,
  first_name text,
  last_name text,
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider, provider_user_id)
);

create index if not exists messenger_identities_user_idx
  on public.messenger_identities (user_id, provider);

create table if not exists public.messenger_sessions (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('telegram', 'max')),
  provider_user_id bigint not null,
  user_id uuid references public.app_users(id) on delete cascade,
  flow text,
  step_key text,
  current_question_id uuid references public.quiz_questions(id) on delete set null,
  answers jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  context jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  primary key (organization_id, provider, provider_user_id)
);

create index if not exists messenger_sessions_expiry_idx
  on public.messenger_sessions (expires_at);

create table if not exists public.messenger_events (
  provider text not null check (provider in ('telegram', 'max')),
  event_key text not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  primary key (provider, event_key)
);

create index if not exists messenger_events_received_idx
  on public.messenger_events (received_at);

alter table public.messenger_identities enable row level security;
alter table public.messenger_sessions enable row level security;
alter table public.messenger_events enable row level security;

comment on table public.messenger_identities is
  'Links one application user to identities in Telegram, MAX and future messengers.';
comment on table public.messenger_sessions is
  'Channel-neutral conversational state for quizzes and onboarding.';

