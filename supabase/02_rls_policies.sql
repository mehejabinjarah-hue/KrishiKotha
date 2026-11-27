-- KrishiKotha (কৃষিকথা) - 02_rls_policies.sql
-- Row Level Security policies and least-privilege grants.
-- Run this second in Supabase SQL Editor.

-- 1. Enable RLS on EVERY table
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.farmers enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inquiries enable row level security;

-- 2. Base schema & table privileges
revoke all on all tables in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.farmers, public.products, public.product_variants, public.product_reviews to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.carts, public.cart_items, public.wishlist_items to authenticated;
grant select on public.orders, public.order_items to authenticated;

-- Allow authenticated callers (including anonymous/guest sessions) to execute order & coupon RPCs
revoke all on function public.place_order(text, text, text, text, text, public.payment_method_enum, text, text) from public;
grant execute on function public.place_order(text, text, text, text, text, public.payment_method_enum, text, text) to authenticated;

revoke all on function public.validate_coupon(text, int) from public;
grant execute on function public.validate_coupon(text, int) to anon, authenticated;

-- 3. Public catalog policies (read-only active items)
drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
  on public.categories for select
  to anon, authenticated
  using (is_active = true);
-- Plain-language note: Visitors and signed-in users can read active categories, but cannot modify them.

drop policy if exists "Public can view active farmers" on public.farmers;
create policy "Public can view active farmers"
  on public.farmers for select
  to anon, authenticated
  using (is_active = true);
-- Plain-language note: Visitors and signed-in users can read active farmer profiles, but cannot edit or delete them.

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true);
-- Plain-language note: Everyone can browse active products; unpublished products stay hidden.

drop policy if exists "Public can view active variants" on public.product_variants;
create policy "Public can view active variants"
  on public.product_variants for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );
-- Plain-language note: Everyone can view active pack sizes and prices belonging to active products.

drop policy if exists "Public can view active reviews" on public.product_reviews;
create policy "Public can view active reviews"
  on public.product_reviews for select
  to anon, authenticated
  using (is_active = true);
-- Plain-language note: Visitors can read verified household reviews; posting reviews is disabled in this version.

-- 4. Coupons (no direct client access; validated server-side / via validate_coupon)
drop policy if exists "No direct client access to coupons" on public.coupons;
create policy "No direct client access to coupons"
  on public.coupons for select
  to anon, authenticated
  using (false);
-- Plain-language note: Customers cannot list all secret coupon codes directly; codes are checked one at a time via validate_coupon.

-- 5. Profiles (strictly own row)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());
-- Plain-language note: Each signed-in user (or guest) can read only their own profile row.

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());
-- Plain-language note: Each signed-in user can create only their own profile row if it does not exist yet.

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
-- Plain-language note: Each signed-in user can update only their own name, phone, address, and language preference.

-- 6. Carts & Cart Items (strictly own cart)
drop policy if exists "Users can view own cart" on public.carts;
create policy "Users can view own cart"
  on public.carts for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert own cart" on public.carts;
create policy "Users can insert own cart"
  on public.carts for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update own cart" on public.carts;
create policy "Users can update own cart"
  on public.carts for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own cart" on public.carts;
create policy "Users can delete own cart"
  on public.carts for delete
  to authenticated
  using (user_id = auth.uid());
-- Plain-language note: Cart rows are private to their owner; User B cannot read or modify User A's basket.

drop policy if exists "Users can manage own cart items" on public.cart_items;
create policy "Users can manage own cart items"
  on public.cart_items for all
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );
-- Plain-language note: Users can add, update, and remove items only inside their own basket.

-- 7. Wishlist Items (strictly own wishlist)
drop policy if exists "Users can manage own wishlist" on public.wishlist_items;
create policy "Users can manage own wishlist"
  on public.wishlist_items for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
-- Plain-language note: Users can view, save, and remove only their own wishlist items.

-- 8. Orders & Order Items (read-only own orders; created ONLY via place_order)
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());
-- Plain-language note: Users can read only their own order history; clients cannot insert or alter orders directly.

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
-- Plain-language note: Users can view line items only for orders they own.

-- 9. Inquiries (anyone can submit; clients cannot read others' submissions)
drop policy if exists "Anyone can submit an inquiry" on public.inquiries;
create policy "Anyone can submit an inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
-- Plain-language note: Anyone can submit Contact, Become a Seller, or Community Buying forms, but cannot read private submissions from others.

-- 10. Verification Query (optional check: every table should show rowsecurity = true)
-- select tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename;
