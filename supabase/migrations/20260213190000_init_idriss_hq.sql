-- Idriss Music Promos HQ schema + RLS
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  platform text not null,
  handle text not null,
  genre text,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  channel text not null,
  message_sent text not null,
  response text,
  outcome text,
  next_followup_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  package_name text not null,
  start_date date,
  end_date date,
  budget_total numeric(12,2) not null default 0,
  my_cut_percent numeric(5,4) not null default 0.35,
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  payment_handle text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.edits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  editor_id uuid not null references public.editors(id) on delete restrict,
  video_link text not null,
  views integer not null default 0,
  due_date date,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  edit_id uuid not null references public.edits(id) on delete cascade,
  editor_id uuid not null references public.editors(id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (edit_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_artists_updated_at before update on public.artists for each row execute procedure public.set_updated_at();
create trigger set_campaigns_updated_at before update on public.campaigns for each row execute procedure public.set_updated_at();
create trigger set_editors_updated_at before update on public.editors for each row execute procedure public.set_updated_at();
create trigger set_edits_updated_at before update on public.edits for each row execute procedure public.set_updated_at();

create or replace function public.compute_editor_payout_cents(p_views int)
returns int
language sql
immutable
as $$
  select least(2000, greatest(1000, 1000 + greatest(0, floor((coalesce(p_views,0) - 10000) / 1000.0))::int * 100));
$$;

create or replace function public.create_or_refresh_payout_for_edit(p_owner uuid, p_edit_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_editor uuid;
  v_views int;
  v_amount int;
  v_id uuid;
begin
  select e.editor_id, e.views into v_editor, v_views
  from public.edits e
  where e.id = p_edit_id and e.owner_id = p_owner;

  if not found then
    raise exception 'Edit not found for owner';
  end if;

  v_amount := public.compute_editor_payout_cents(v_views);

  insert into public.payouts (owner_id, edit_id, editor_id, amount_cents, status)
  values (p_owner, p_edit_id, v_editor, v_amount, 'pending')
  on conflict (edit_id)
  do update set amount_cents = excluded.amount_cents, editor_id = excluded.editor_id
  returning id into v_id;

  return v_id;
end;
$$;

create or replace view public.campaign_profitability as
select
  c.id as campaign_id,
  c.owner_id,
  c.package_name,
  c.status,
  c.budget_total,
  c.my_cut_percent,
  round((coalesce(c.budget_total, 0) * coalesce(c.my_cut_percent, 0))::numeric, 2) as my_revenue,
  coalesce(sum(p.amount_cents), 0) / 100.0 as payouts_total,
  round((coalesce(c.budget_total, 0) - (coalesce(sum(p.amount_cents), 0) / 100.0))::numeric, 2) as profit_estimate
from public.campaigns c
left join public.edits e on e.campaign_id = c.id
left join public.payouts p on p.edit_id = e.id
group by c.id;

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.conversations enable row level security;
alter table public.campaigns enable row level security;
alter table public.editors enable row level security;
alter table public.edits enable row level security;
alter table public.payouts enable row level security;

create policy "own profiles" on public.profiles using (id = auth.uid()) with check (id = auth.uid());
create policy "own artists" on public.artists using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own conversations" on public.conversations using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own campaigns" on public.campaigns using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own editors" on public.editors using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own edits" on public.edits using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own payouts" on public.payouts using (owner_id = auth.uid()) with check (owner_id = auth.uid());

grant select on public.campaign_profitability to authenticated;
