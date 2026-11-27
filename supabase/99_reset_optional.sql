-- KrishiKotha (কৃষিকথা) - 99_reset_optional.sql
-- WARNING: DESTRUCTIVE SCRIPT!
-- Only run this if you intentionally want to wipe all KrishiKotha tables and start over.
-- After running this, run 01_schema.sql, 02_rls_policies.sql, and 03_seed.sql in order.

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;

drop function if exists public.place_order(text, text, text, text, text, public.payment_method_enum, text, text);
drop function if exists public.validate_coupon(text, int);
drop function if exists public.handle_new_user();
drop function if exists public.handle_user_updated();
drop function if exists public.set_updated_at();

drop table if exists public.inquiries cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.wishlist_items cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.carts cascade;
drop table if exists public.coupons cascade;
drop table if exists public.product_reviews cascade;
drop table if exists public.product_variants cascade;
drop table if exists public.products cascade;
drop table if exists public.farmers cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

drop sequence if exists public.order_number_seq;

drop type if exists public.inquiry_type_enum;
drop type if exists public.discount_type_enum;
drop type if exists public.payment_method_enum;
drop type if exists public.order_status_enum;
drop type if exists public.farming_practice_enum;
