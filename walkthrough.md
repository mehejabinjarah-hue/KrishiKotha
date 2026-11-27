# KrishiKotha Review, Cart/Auth Fixes & Security Walkthrough

## Summary of Fixes Applied

1. **Shopping Cart & Basket Reliability**
   - Added an in-memory fallback mirror inside `src/demo/demoStore.ts` so the cart, wishlist, saved profile, and preview orders continue working even when `localStorage` is restricted inside embedded preview frames.
   - Added full optimistic total recalculation (`recomputeOptimisticCart`) in `src/hooks/useStore.ts` across item quantity updates and removals, plus exposed `useClearCart()` and `useAddBatchToCart()`.
   - Fixed the Homepage **Add Weekly Basket** button (`src/pages/HomePage.tsx`) to add all 4 staples of the Standard Weekly Basket together via `addBatch` so customers reliably receive the full pack and automatic 15% Weekly Basket saving.
   - Added live in-card quantity steppers on `ProductCard`, free-delivery progress bars and inline basket-clear confirmation in `CartDrawer` & `CartPage`, and unlocked rapid stepper clicking in `CartItemRow`.
   - Fixed `ensureUserCart` in `server/handlers/cart.ts` to use `upsert(..., { onConflict: 'user_id', ignoreDuplicates: true })` so parallel cart requests for first-time guests/users cannot collide with a unique-constraint failure.

2. **Authentication, Guest Access & Design Polish**
   - Upgraded `AuthPanel` and redesigned `LoginPage` (`src/pages/AuthPages.tsx`) with a 2-column responsive harvest showcase, an instant 1-tap **Continue as Guest** card, prominent **Continue with Google**, password visibility toggle, and active guest state in Demo Preview mode (`src/hooks/useAuth.tsx`).
   - Improved `AuthCallbackPage` to parse OAuth `error` / `error_description` parameters and subscribe cleanly to `onAuthStateChange` instead of relying on a fixed delay.
   - Replaced all `window.confirm` browser prompts with accessible in-app confirmation modals (`Layout.tsx`, `AccountPage.tsx`), eliminated nested `<Link><Button>` markup via `<Button to="...">`, added collapsible mobile search in `Layout.tsx`, and enabled profile persistence in Demo Preview.

3. **Database, Routing & Deployment Compatibility**
   - Added missing `INSERT` permission and row-level policy on `public.profiles` (`supabase/02_rls_policies.sql`) so new or guest users calling `GET /api/me` never hit a permission denied error on initial profile creation.
   - Tightened search-term filter escaping in `server/handlers/products.ts`.
   - Fixed `vite.config.ts` `configurePreviewServer` so `npm run preview` handles `/api/*` via Vite SSR loading of `server/router.ts` rather than importing an uncompiled `.js` path.

---

# Security Summary

| Area | Check & Hardening Applied | Verification Outcome |
|---|---|---|
| **Client Secrets & Service Keys** | Scanned `src/`, `server/`, `api/`, and `supabase/` for any `service_role` reference or private keys; only public `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are exposed to the browser, and all server Supabase calls execute with the verified user JWT under Row Level Security. | Verified via code search & file review (0 leaks) |
| **Row Level Security & Auth Boundaries** | Audited `supabase/02_rls_policies.sql` and `server/auth.ts`. Every private endpoint (`cart`, `wishlist`, `orders`, `me`) requires a valid Bearer token resolved by `supabase.auth.getUser(token)`. Added the missing authenticated `INSERT` policy (`id = auth.uid()`) on `public.profiles`. | Verified in SQL policies & `server/auth.ts` |
| **Server-Side Pricing & Atomic Checkout** | Confirmed cart totals, 15% Weekly Basket savings, `KRISHI100` eligibility, delivery fees, and stock decrements are computed server-side (`server/pricing.ts` & Postgres `place_order` RPC) and validated with Zod schemas (`shared/schemas.ts`), ignoring client-supplied prices. | Verified via `pricing.test.ts` & handler audit |
| **Input Escaping & Abuse Protection** | Hardened search filter escaping (`server/handlers/products.ts`), enforced strict quantity bounds (`1..50`) and stock checks, verified in-memory rate limiting on public writes (`server/rateLimit.ts`), and confirmed zero `dangerouslySetInnerHTML`, `eval`, or `window.open`/`confirm`/`alert` calls. | Verified via grep audit & `demoStore.test.ts` |

## PoC Verification

- **Pricing & Boundary Integrity (`tests/pricing.test.ts`)**: Verified empty cart totals, exact delivery-fee boundary (`৳798` adds `৳60` delivery vs `৳799` free delivery), 4-distinct-staple 15% Weekly Basket discount rule, single-product multi-unit exclusion, and coupon floor/cap clamping (`npm run test`).
- **Cart, Stock Cap, Coupon & Guest Checkout Flow (`tests/demoStore.test.ts`)**: Verified cart add/update/remove without `window.localStorage`, batch Weekly Basket discount activation, rejection of `KRISHI100` below `৳799` + automatic coupon removal when cart subtotal drops below `৳799`, rejection of quantities above `50`, wishlist updates, and order creation emptying the basket (`npm run test`).
- **Unsafe DOM / Browser Dialog / Secret Scan**: Executed `grep -rnE "window\.(confirm|alert|open)|dangerouslySetInnerHTML|eval\(|new Function|service_role" src api server supabase` — returned zero matches.
