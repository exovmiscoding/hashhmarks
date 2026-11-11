-- Hashmarks accounts, sessions and card pulls.

create table if not exists users (
  id bigserial primary key,
  username text not null,
  username_lower text not null unique,
  password_hash text not null,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  user_id bigint not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists pulls (
  id bigserial primary key,
  user_id bigint not null references users (id) on delete cascade,
  player_id text not null,
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  reward integer not null check (reward >= 0),
  created_at timestamptz not null default now()
);

create index if not exists pulls_user_idx on pulls (user_id, created_at desc);
create index if not exists pulls_user_player_idx on pulls (user_id, player_id);
