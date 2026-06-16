-- DJDS Community Vision — database schema (BUILD-SPEC §12).
-- Run this in your Supabase project: SQL Editor → paste → Run.
--
-- Access model: all reads/writes go through the Next.js server using the
-- SERVICE ROLE key, which bypasses RLS. We enable RLS with NO policies so the
-- anon/public key has zero access — the browser never touches these tables.

create extension if not exists pgcrypto;

-- ---- sessions ---------------------------------------------------------------
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  scale_mode text not null default 'open',     -- 'open' | 'room'|'building'|'block'|'city'|'planet'
  visibility text not null default 'private',   -- 'private' | 'public'
  status text not null default 'open',          -- 'open' | 'closed'
  facilitator_pin_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- contributions ----------------------------------------------------------
create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,  -- nullable (standalone)
  display_name text,
  language text not null default 'en',
  scale text not null,                          -- room|building|block|city|planet
  my_people_are text,
  sensory_feelings text[] not null default '{}',
  community_belonging text[] not null default '{}',
  sensory_imagination text,
  feelings text[] not null default '{}',
  features text[] not null default '{}',
  final_vision text,
  image_url text not null,                       -- Storage public URL (or a data: URL fallback)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contributions_session_id_idx on contributions (session_id);
create index if not exists sessions_slug_idx on sessions (slug);

-- ---- storage bucket for generated images ------------------------------------
-- Public read so vision image URLs work in <img>. Writes go through the server
-- with the service role (which bypasses Storage RLS).
insert into storage.buckets (id, name, public)
values ('visions', 'visions', true)
on conflict (id) do nothing;

-- ---- lock down (service-role-only access) -----------------------------------
alter table sessions enable row level security;
alter table contributions enable row level security;
-- No policies are created on purpose: with RLS enabled and no policies, the
-- anon/auth roles are denied all access while the service role bypasses RLS.
