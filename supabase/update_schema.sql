-- Allow more transaction types
alter table transactions drop constraint if exists transactions_type_check;
alter table transactions add constraint transactions_type_check check (type in ('income', 'expense', 'adjustment', 'transfer'));

-- Create Categories Table for Debts
create table if not exists debt_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users default auth.uid(),
  name text not null,
  created_at timestamptz default timezone('utc'::text, now())
);

alter table debt_categories enable row level security;

create policy "Users can perform all actions on their own debt categories"
on debt_categories for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Add category_id to debts
alter table debts add column if not exists category_id uuid references debt_categories(id) on delete set null;
