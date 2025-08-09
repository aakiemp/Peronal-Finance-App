-- users handled by auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text
);

create type if not exists account_type as enum ('cash','checking','savings','credit','investment');

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type account_type not null,
  institution text,
  balance_cents bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income','expense','transfer')),
  color text default '#64748b',
  is_system boolean not null default false
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month date not null, -- use first of month
  amount_cents bigint not null,
  unique (user_id, category_id, month)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  occurred_at date not null,
  amount_cents bigint not null, -- negative for expense, positive for income
  merchant text,
  memo text,
  category_id uuid references public.categories(id) on delete set null,
  is_transfer boolean not null default false,
  created_at timestamptz not null default now(),
  import_hash text -- for de-dupe on CSV import
);

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_field text not null check (match_field in ('merchant','memo')),
  operator text not null check (operator in ('contains','equals','starts_with','ends_with','regex')),
  value text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  priority int not null default 100
);

-- RLS
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table budgets enable row level security;
alter table transactions enable row level security;
alter table rules enable row level security;

create policy if not exists "user owns rows" on profiles for all using (id = auth.uid());
create policy if not exists "user owns rows" on accounts for all using (user_id = auth.uid());
create policy if not exists "user owns rows" on categories for all using (user_id = auth.uid());
create policy if not exists "user owns rows" on budgets for all using (user_id = auth.uid());
create policy if not exists "user owns rows" on transactions for all using (user_id = auth.uid());
create policy if not exists "user owns rows" on rules for all using (user_id = auth.uid());

-- Seed essential system categories per user on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create profile
  insert into public.profiles (id, display_name) values (new.id, new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;

  -- Seed categories: Income, Uncategorized, Transfer
  insert into public.categories (user_id, name, kind, color, is_system)
  values
    (new.id, 'Income', 'income', '#16a34a', true),
    (new.id, 'Uncategorized', 'expense', '#64748b', true),
    (new.id, 'Transfer', 'transfer', '#0ea5e9', true)
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();