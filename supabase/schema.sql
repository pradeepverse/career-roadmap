-- Career Roadmap — Supabase Schema
-- Run this in your Supabase SQL editor after creating a project.

-- Progress table: one row per user, stores the full progress state as JSON
create table if not exists progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table progress enable row level security;
create policy "Users can read own progress" on progress for select using (auth.uid() = user_id);
create policy "Users can upsert own progress" on progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on progress for update using (auth.uid() = user_id);

-- Log entries table
create table if not exists log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_number integer not null,
  date date not null,
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  type text not null check (type in ('learning', 'reflection', 'blocker', 'win')),
  created_at timestamptz not null default now()
);

create index on log_entries(user_id, date desc);

alter table log_entries enable row level security;
create policy "Users can read own logs" on log_entries for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on log_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own logs" on log_entries for update using (auth.uid() = user_id);
create policy "Users can delete own logs" on log_entries for delete using (auth.uid() = user_id);

-- Public profiles view (for the share page)
-- Enable by running: grant select on public_profiles to anon;
create or replace view public_profiles as
  select
    p.user_id,
    p.state,
    p.updated_at
  from progress p;
