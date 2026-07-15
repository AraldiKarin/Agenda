-- perfis
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  color text not null default '#E3242B',
  created_at timestamptz default now()
);

-- missoes
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  date date not null,
  time time,
  period text not null default 'dia' check (period in ('dia', 'noite')),
  owner_profile uuid references profiles(id) on delete set null,
  priority text not null default 'secundaria' check (priority in ('principal', 'secundaria')),
  done boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- calling cards
create table if not exists calling_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  from_profile uuid not null references profiles(id) on delete cascade,
  to_profile uuid not null references profiles(id) on delete cascade,
  message text not null,
  date date,
  time time,
  status text not null default 'pendente' check (status in ('pendente', 'aceito', 'negociando')),
  created_at timestamptz default now()
);

-- achivements
-- check-ins (1 por perfil por dia, garantido pela constraint)
create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  created_at timestamptz default now(),
  unique (profile_id, date)
);

alter table check_ins enable row level security;

create policy "own check_ins" on check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter publication supabase_realtime add table check_ins;

create index if not exists idx_checkins_profile on check_ins(profile_id, date);

-- rls: tudo pertence a conta autenticada
alter table profiles enable row level security;
alter table missions enable row level security;
alter table calling_cards enable row level security;

create policy "own profiles" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own missions" on missions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own calling_cards" on calling_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- realtime
alter publication supabase_realtime add table missions;
alter publication supabase_realtime add table calling_cards;
alter publication supabase_realtime add table profiles;

-- indices
create index if not exists idx_missions_date on missions(date);
create index if not exists idx_cards_status on calling_cards(status);
