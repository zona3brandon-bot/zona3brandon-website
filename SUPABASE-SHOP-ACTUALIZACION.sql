-- ZONA 3B SHOP - ACTUALIZACIÓN COMPATIBLE
-- Ejecutar en Supabase SQL Editor. No elimina datos.
create extension if not exists pgcrypto;
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null,
  department text not null, description text, price numeric(12,2) not null default 0,
  stock integer not null default 0, image_url text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists active boolean not null default true;
alter table public.products add column if not exists stock integer not null default 0;
alter table public.products add column if not exists price numeric(12,2) not null default 0;
alter table public.products add column if not exists updated_at timestamptz not null default now();
create unique index if not exists products_sku_unique on public.products(sku) where sku is not null;
create sequence if not exists public.order_number_seq start 1001;
create or replace function public.make_order_number() returns text language sql volatile as $$ select 'Z3B-'||to_char(now(),'YYYYMMDD')||'-'||nextval('public.order_number_seq')::text $$;
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), order_number text not null unique default public.make_order_number(),
 customer_name text not null, phone text not null, address text not null, id_number text not null,
 items jsonb not null default '[]'::jsonb, subtotal numeric(12,2) not null default 0,
 status text not null default 'pendiente', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.orders alter column order_number set default public.make_order_number();
alter table public.orders add column if not exists city text;
alter table public.orders add column if not exists state text;
alter table public.orders add column if not exists zip_code text;
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists shipping_method text;
alter table public.orders add column if not exists shipping_cost numeric(12,2) not null default 0;
alter table public.orders add column if not exists updated_at timestamptz not null default now();
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade,role text not null default 'admin',created_at timestamptz not null default now());
insert into public.admin_users(user_id,role) values('f89e3bf2-7e8c-4f4d-97b6-e25ae1b52b89','admin') on conflict(user_id) do update set role='admin';
alter table public.products enable row level security;alter table public.orders enable row level security;alter table public.admin_users enable row level security;
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select to anon,authenticated using(active=true or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "public create orders" on public.orders;
create policy "public create orders" on public.orders for insert to anon,authenticated with check(true);
drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders for select to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "admin reads own role" on public.admin_users;
create policy "admin reads own role" on public.admin_users for select to authenticated using(user_id=auth.uid());
