-- KrishiKotha (কৃষিকথা) - 01_schema.sql
-- Idempotent PostgreSQL schema for Supabase.
-- Run this first in Supabase SQL Editor.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 1. Enums (created idempotently)
do $$ begin
  create type public.farming_practice_enum as enum (
    'organic',
    'pesticide_free',
    'gap_certified',
    'conventional_verified'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status_enum as enum (
    'placed',
    'confirmed',
    'dispatched',
    'delivered',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method_enum as enum (
    'cod',
    'bkash',
    'nagad',
    'card'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.discount_type_enum as enum (
    'flat',
    'percent'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.inquiry_type_enum as enum (
    'contact',
    'seller',
    'community_building'
  );
exception
  when duplicate_object then null;
end $$;

-- 2. Shared updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  address_line text not null default '',
  area text not null default 'Gulshan',
  city text not null default 'Dhaka',
  postal_code text not null default '',
  preferred_language text not null default 'en' check (preferred_language in ('en', 'bn')),
  avatar_url text,
  is_guest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 4. Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_bn text not null,
  icon text not null default 'eco',
  sort_order int not null default 0,
  image_url text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. Farmers
create table if not exists public.farmers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_bn text not null,
  district text not null,
  upazila text not null default '',
  specialty text not null,
  years_farming int not null default 5 check (years_farming >= 0),
  acres numeric(5, 1) not null default 2.0 check (acres >= 0),
  story text not null default '',
  quote text not null default '',
  photo_url text not null default '',
  is_verified boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid not null references public.categories (id) on delete restrict,
  farmer_id uuid not null references public.farmers (id) on delete restrict,
  name_en text not null,
  name_bn text not null,
  description_en text not null default '',
  description_bn text not null default '',
  image_url text not null default '',
  gallery_urls text[] not null default '{}',
  origin_district text not null,
  origin_hub text not null default 'Tejgaon Hub',
  harvest_time timestamptz not null default now(),
  harvested_today boolean not null default true,
  harvest_window text not null default 'today' check (harvest_window in ('today', '12h', 'preorder')),
  harvest_label text not null default 'Harvested 5:30 AM',
  farming_practice public.farming_practice_enum not null default 'organic',
  badges text[] not null default '{}',
  trace_id text not null default '',
  trace_log jsonb not null default '[]'::jsonb,
  rating_avg numeric(2, 1) not null default 4.8 check (rating_avg >= 0 and rating_avg <= 5),
  rating_count int not null default 0 check (rating_count >= 0),
  is_featured boolean not null default false,
  basket_eligible boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_farmer on public.products (farmer_id);
create index if not exists idx_products_district on public.products (origin_district);
create index if not exists idx_products_active_featured on public.products (is_active, is_featured);
create index if not exists idx_products_name_en_trgm on public.products using gin (name_en gin_trgm_ops);
create index if not exists idx_products_name_bn_trgm on public.products using gin (name_bn gin_trgm_ops);

-- 7. Product Variants (Authoritative pricing lives ONLY here)
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  label_en text not null,
  label_bn text not null,
  unit_weight_grams int not null default 500 check (unit_weight_grams > 0),
  price_bdt int not null check (price_bdt > 0),
  compare_at_price_bdt int check (compare_at_price_bdt is null or compare_at_price_bdt > 0),
  stock_qty int not null default 50 check (stock_qty >= 0),
  is_default boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_variants_product on public.product_variants (product_id);
create index if not exists idx_variants_price on public.product_variants (price_bdt);

-- 8. Product Reviews
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  author_name text not null,
  area text not null default 'Dhaka',
  rating int not null check (rating between 1 and 5),
  comment text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product on public.product_reviews (product_id);

-- 9. Coupons
create table if not exists public.coupons (
  code text primary key,
  description text not null,
  discount_type public.discount_type_enum not null,
  discount_value int not null check (discount_value > 0),
  min_subtotal_bdt int not null default 0 check (min_subtotal_bdt >= 0),
  is_active boolean not null default true,
  expires_at timestamptz
);

-- 10. Carts (no prices stored here)
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  coupon_code text references public.coupons (code) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_carts_updated_at on public.carts;
create trigger trg_carts_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity int not null check (quantity between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index if not exists idx_cart_items_cart on public.cart_items (cart_id);
create index if not exists idx_cart_items_variant on public.cart_items (variant_id);

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- 11. Wishlist Items
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlist_user on public.wishlist_items (user_id);

-- 12. Orders & Order Items
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.order_status_enum not null default 'placed',
  payment_method public.payment_method_enum not null default 'cod',
  payment_status text not null default 'demo_not_charged',
  subtotal_bdt int not null check (subtotal_bdt >= 0),
  basket_discount_bdt int not null default 0 check (basket_discount_bdt >= 0),
  coupon_code text,
  coupon_discount_bdt int not null default 0 check (coupon_discount_bdt >= 0),
  delivery_fee_bdt int not null default 0 check (delivery_fee_bdt >= 0),
  total_bdt int not null check (total_bdt >= 0),
  delivery_name text not null,
  delivery_phone text not null,
  delivery_address text not null,
  delivery_area text not null,
  delivery_slot text not null,
  notes text not null default '',
  idempotency_key text,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index if not exists idx_orders_user_created on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  product_name_en text not null,
  product_name_bn text not null,
  variant_label text not null,
  unit_price_bdt int not null check (unit_price_bdt >= 0),
  quantity int not null check (quantity between 1 and 50),
  line_total_bdt int not null check (line_total_bdt >= 0),
  image_url text not null default ''
);

create index if not exists idx_order_items_order on public.order_items (order_id);

-- 13. Inquiries (Contact, Become a Seller, Community Building)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type public.inquiry_type_enum not null,
  name text not null,
  email text not null default '',
  phone text not null,
  message text not null default '',
  extra jsonb not null default '{}'::jsonb,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_inquiries_type_created on public.inquiries (type, created_at desc);

-- 14. Auto-create Profile + Cart on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_avatar text;
begin
  v_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    ''
  );
  v_avatar := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.profiles (id, full_name, avatar_url, is_guest)
  values (
    new.id,
    v_name,
    v_avatar,
    coalesce(new.is_anonymous, false)
  )
  on conflict (id) do update
    set is_guest = excluded.is_guest,
        full_name = case
          when public.profiles.full_name = '' then excluded.full_name
          else public.profiles.full_name
        end,
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  insert into public.carts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profile.is_guest synced when a guest links email or Google identity
create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    is_guest = coalesce(new.is_anonymous, false),
    full_name = case
      when full_name = '' then coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
      else full_name
    end,
    avatar_url = coalesce(avatar_url, new.raw_user_meta_data ->> 'avatar_url')
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_updated();

-- 15. Coupon Validation Helper (used by API and place_order)
create or replace function public.validate_coupon(p_code text, p_subtotal_after_basket int)
returns table (
  is_valid boolean,
  code text,
  discount_bdt int,
  error_message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons%rowtype;
  v_discount int;
begin
  if p_code is null or btrim(p_code) = '' then
    return query select false, null::text, 0, 'No coupon provided';
    return;
  end if;

  select * into v_coupon
  from public.coupons c
  where upper(c.code) = upper(btrim(p_code));

  if not found or not v_coupon.is_active then
    return query select false, upper(btrim(p_code)), 0, 'Invalid or inactive coupon code';
    return;
  end if;

  if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
    return query select false, v_coupon.code, 0, 'This coupon has expired';
    return;
  end if;

  if p_subtotal_after_basket < v_coupon.min_subtotal_bdt then
    return query select
      false,
      v_coupon.code,
      0,
      format('Minimum order of ৳%s required for coupon %s', v_coupon.min_subtotal_bdt, v_coupon.code);
    return;
  end if;

  if v_coupon.discount_type = 'flat' then
    v_discount := least(v_coupon.discount_value, p_subtotal_after_basket);
  else
    v_discount := round((p_subtotal_after_basket * v_coupon.discount_value)::numeric / 100.0)::int;
  end if;

  return query select true, v_coupon.code, greatest(0, v_discount), null::text;
end;
$$;

-- 16. Transactional Order Placement Function
-- Never trusts client prices or totals. Uses auth.uid() exclusively.
create or replace function public.place_order(
  p_delivery_name text,
  p_delivery_phone text,
  p_delivery_address text,
  p_delivery_area text,
  p_delivery_slot text,
  p_payment_method public.payment_method_enum,
  p_notes text default '',
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart public.carts%rowtype;
  v_existing_order public.orders%rowtype;
  v_subtotal int := 0;
  v_eligible_subtotal int := 0;
  v_distinct_eligible int := 0;
  v_basket_discount int := 0;
  v_after_basket int := 0;
  v_coupon_discount int := 0;
  v_coupon_code text := null;
  v_coupon_valid boolean;
  v_coupon_err text;
  v_after_discounts int := 0;
  v_delivery_fee int := 0;
  v_total int := 0;
  v_order_id uuid;
  v_order_number text;
  v_seq bigint;
  v_item record;
begin
  if v_user_id is null then
    raise exception 'UNAUTHORIZED: Sign in required to place an order' using errcode = 'P0001';
  end if;

  -- Idempotency check
  if p_idempotency_key is not null and btrim(p_idempotency_key) <> '' then
    select * into v_existing_order
    from public.orders o
    where o.user_id = v_user_id and o.idempotency_key = p_idempotency_key;
    if found then
      return to_jsonb(v_existing_order);
    end if;
  end if;

  -- Validate required delivery fields
  if btrim(coalesce(p_delivery_name, '')) = '' or
     btrim(coalesce(p_delivery_phone, '')) = '' or
     btrim(coalesce(p_delivery_address, '')) = '' or
     btrim(coalesce(p_delivery_area, '')) = '' then
    raise exception 'VALIDATION_ERROR: Delivery name, phone, address, and area are required' using errcode = 'P0001';
  end if;

  -- Lock the user's cart
  select * into v_cart
  from public.carts c
  where c.user_id = v_user_id
  for update;

  if not found then
    raise exception 'CART_EMPTY: Your basket is empty' using errcode = 'P0001';
  end if;

  -- Check items, lock variants, verify stock & active flags, compute subtotal
  for v_item in
    select
      ci.id as cart_item_id,
      ci.quantity,
      pv.id as variant_id,
      pv.price_bdt,
      pv.stock_qty,
      pv.is_active as variant_active,
      pv.label_en as variant_label,
      p.id as product_id,
      p.name_en,
      p.name_bn,
      p.image_url,
      p.is_active as product_active,
      p.basket_eligible
    from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    where ci.cart_id = v_cart.id
    order by ci.created_at
    for update of pv
  loop
    if not v_item.product_active or not v_item.variant_active then
      raise exception 'UNAVAILABLE_ITEM: % is no longer available', v_item.name_en using errcode = 'P0001';
    end if;

    if v_item.stock_qty < v_item.quantity then
      raise exception 'OUT_OF_STOCK: Only % left of % (%)', v_item.stock_qty, v_item.name_en, v_item.variant_label using errcode = 'P0001';
    end if;

    v_subtotal := v_subtotal + (v_item.price_bdt * v_item.quantity);
    if v_item.basket_eligible then
      v_eligible_subtotal := v_eligible_subtotal + (v_item.price_bdt * v_item.quantity);
    end if;
  end loop;

  if v_subtotal = 0 then
    raise exception 'CART_EMPTY: Your basket is empty' using errcode = 'P0001';
  end if;

  -- Weekly basket discount: 15% off basket_eligible items when >= 4 distinct basket_eligible products
  select count(distinct p.id) into v_distinct_eligible
  from public.cart_items ci
  join public.product_variants pv on pv.id = ci.variant_id
  join public.products p on p.id = pv.product_id
  where ci.cart_id = v_cart.id and p.basket_eligible = true;

  if v_distinct_eligible >= 4 then
    v_basket_discount := round((v_eligible_subtotal * 15)::numeric / 100.0)::int;
  end if;

  v_after_basket := greatest(0, v_subtotal - v_basket_discount);

  -- Coupon validation
  if v_cart.coupon_code is not null then
    select vc.is_valid, vc.code, vc.discount_bdt, vc.error_message
      into v_coupon_valid, v_coupon_code, v_coupon_discount, v_coupon_err
    from public.validate_coupon(v_cart.coupon_code, v_after_basket) vc;

    if not v_coupon_valid then
      raise exception 'INVALID_COUPON: %', coalesce(v_coupon_err, 'Coupon is not valid for this cart') using errcode = 'P0001';
    end if;
  end if;

  v_after_discounts := greatest(0, v_after_basket - v_coupon_discount);

  -- Delivery fee: 60 BDT if after-discount subtotal < 799, free >= 799
  if v_after_discounts >= 799 then
    v_delivery_fee := 0;
  else
    v_delivery_fee := 60;
  end if;

  v_total := greatest(0, v_after_discounts + v_delivery_fee);

  v_seq := nextval('public.order_number_seq');
  v_order_number := format('KK-%s-%s', to_char(now() at time zone 'Asia/Dhaka', 'YYYYMMDD'), lpad(v_seq::text, 4, '0'));

  insert into public.orders (
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    subtotal_bdt,
    basket_discount_bdt,
    coupon_code,
    coupon_discount_bdt,
    delivery_fee_bdt,
    total_bdt,
    delivery_name,
    delivery_phone,
    delivery_address,
    delivery_area,
    delivery_slot,
    notes,
    idempotency_key
  ) values (
    v_order_number,
    v_user_id,
    'placed',
    p_payment_method,
    'demo_not_charged',
    v_subtotal,
    v_basket_discount,
    v_coupon_code,
    v_coupon_discount,
    v_delivery_fee,
    v_total,
    btrim(p_delivery_name),
    btrim(p_delivery_phone),
    btrim(p_delivery_address),
    btrim(p_delivery_area),
    btrim(p_delivery_slot),
    btrim(coalesce(p_notes, '')),
    nullif(btrim(coalesce(p_idempotency_key, '')), '')
  )
  returning id into v_order_id;

  -- Insert snapshots & decrement stock
  for v_item in
    select
      ci.quantity,
      pv.id as variant_id,
      pv.price_bdt,
      pv.label_en as variant_label,
      p.id as product_id,
      p.name_en,
      p.name_bn,
      p.image_url
    from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    where ci.cart_id = v_cart.id
  loop
    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name_en,
      product_name_bn,
      variant_label,
      unit_price_bdt,
      quantity,
      line_total_bdt,
      image_url
    ) values (
      v_order_id,
      v_item.product_id,
      v_item.variant_id,
      v_item.name_en,
      v_item.name_bn,
      v_item.variant_label,
      v_item.price_bdt,
      v_item.quantity,
      v_item.price_bdt * v_item.quantity,
      v_item.image_url
    );

    update public.product_variants
    set stock_qty = stock_qty - v_item.quantity
    where id = v_item.variant_id;
  end loop;

  -- Clear cart
  delete from public.cart_items where cart_id = v_cart.id;
  update public.carts set coupon_code = null where id = v_cart.id;

  select * into v_existing_order from public.orders where id = v_order_id;
  return to_jsonb(v_existing_order);
end;
$$;
