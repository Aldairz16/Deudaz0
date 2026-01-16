-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Wallets Table
create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users default auth.uid(),
  name text not null,
  color text,
  balance numeric default 0,
  currency text default 'PEN',
  created_at timestamptz default timezone('utc'::text, now())
);

alter table wallets enable row level security;

create policy "Users can perform all actions on their own wallets"
on wallets for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- Transactions Table
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users default auth.uid(),
  wallet_id uuid references wallets(id) on delete cascade not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')),
  date timestamptz default timezone('utc'::text, now()),
  category text,
  created_at timestamptz default timezone('utc'::text, now())
);

alter table transactions enable row level security;

create policy "Users can perform all actions on their own transactions"
on transactions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- Debts Table
create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users default auth.uid(),
  person_name text not null,
  amount numeric not null,
  type text check (type in ('payable', 'receivable')),
  due_date timestamptz,
  status text check (status in ('pending', 'paid')) default 'pending',
  created_at timestamptz default timezone('utc'::text, now())
);

alter table debts enable row level security;

create policy "Users can perform all actions on their own debts"
on debts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Helper function to handle user creation automatically if needed (optional)
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.wallets (user_id, name, color, balance)
--   values (new.id, 'Principal', 'blue', 0);
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
