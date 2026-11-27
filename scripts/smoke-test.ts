/**
 * End-to-end API & RLS smoke test against a live KrishiKotha server + Supabase project.
 * Usage:
 *   BASE_URL=http://localhost:3000 npm run smoke
 */
import { createClient } from '@supabase/supabase-js';

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    throw new Error(`SMOKE TEST FAILED: ${msg}`);
  }
}

async function api<T>(path: string, init: RequestInit = {}, token?: string): Promise<{ status: number; json: { ok: boolean; data?: T; error?: { code: string; message: string } } }> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${BASE_URL}/api${path}`, { ...init, headers });
  const json = await res.json();
  return { status: res.status, json };
}

async function main() {
  console.log(`Running KrishiKotha smoke tests against ${BASE_URL}...`);

  // 1. Health
  const health = await api<{ status: string; supabaseConfigured: boolean; databaseReachable: boolean }>('/health');
  assert(health.status === 200 && health.json.ok, 'GET /api/health failed');
  console.log('✓ Health:', health.json.data);

  if (!health.json.data?.supabaseConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('! Supabase env vars are not configured yet; skipping live DB/auth steps.');
    return;
  }

  // 2. Public catalog
  const listRes = await api<{ items: { id: string; slug: string; variants: { id: string; price_bdt: number }[] }[]; total: number }>('/products?pageSize=12');
  assert(listRes.status === 200 && listRes.json.ok && (listRes.json.data?.items.length ?? 0) > 0, 'GET /api/products failed');
  console.log(`✓ Listed ${listRes.json.data!.items.length} products (total ${listRes.json.data!.total})`);

  const first = listRes.json.data!.items[0];
  const detailRes = await api<{ id: string }>(`/products/${first.slug}`);
  assert(detailRes.status === 200 && detailRes.json.ok, 'GET /api/products/:slug failed');
  console.log(`✓ Fetched product detail: ${first.slug}`);

  // 3. Unauthenticated request must get 401
  const unauthCart = await api('/cart');
  assert(unauthCart.status === 401, `Expected 401 on unauthenticated /api/cart, got ${unauthCart.status}`);
  console.log('✓ Unauthenticated /api/cart rejected with 401');

  // 4. Anonymous sign-in (User A)
  const sbA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const anonA = await sbA.auth.signInAnonymously();
  assert(!anonA.error && anonA.data.session, `Anonymous sign-in failed: ${anonA.error?.message}`);
  const tokenA = anonA.data.session.access_token;
  console.log('✓ User A signed in anonymously');

  // 5. Add & update cart item
  const variant = first.variants[0];
  const addCart = await api<{ items: { id: string; quantity: number }[]; total_bdt: number }>(
    '/cart/items',
    { method: 'POST', body: JSON.stringify({ variantId: variant.id, quantity: 2 }) },
    tokenA
  );
  assert(addCart.status === 201 && addCart.json.ok, 'POST /api/cart/items failed');
  const itemId = addCart.json.data!.items[0].id;
  const updCart = await api<{ subtotal_bdt: number; total_bdt: number }>(
    `/cart/items/${itemId}`,
    { method: 'PATCH', body: JSON.stringify({ quantity: 3 }) },
    tokenA
  );
  assert(updCart.status === 200 && updCart.json.ok, 'PATCH /api/cart/items/:id failed');
  const expectedCartTotal = updCart.json.data!.total_bdt;
  console.log(`✓ Cart updated; server total = ৳${expectedCartTotal}`);

  // 6. Wishlist add/remove
  const wishAdd = await api('/wishlist', { method: 'POST', body: JSON.stringify({ productId: first.id }) }, tokenA);
  assert(wishAdd.status === 201 && wishAdd.json.ok, 'POST /api/wishlist failed');
  const wishDel = await api(`/wishlist/${first.id}`, { method: 'DELETE' }, tokenA);
  assert(wishDel.status === 200 && wishDel.json.ok, 'DELETE /api/wishlist/:id failed');
  console.log('✓ Wishlist add/remove verified');

  // 7. Reject tampered price/total in order payload
  const tampered = await api(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        delivery_name: 'Smoke Test User',
        delivery_phone: '01712345678',
        delivery_address: 'House 10, Road 5, Gulshan',
        delivery_area: 'Gulshan',
        delivery_slot: 'Morning Dispatch (11:00 AM - 2:00 PM)',
        payment_method: 'cod',
        total_bdt: 1,
      }),
    },
    tokenA
  );
  assert(tampered.status === 422, `Expected 422 for tampered total_bdt, got ${tampered.status}`);
  console.log('✓ Tampered price/total in order body rejected');

  // 8. Place valid demonstration order and verify total matches server cart total
  const orderRes = await api<{ id: string; order_number: string; total_bdt: number }>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        delivery_name: 'Smoke Test User',
        delivery_phone: '01712345678',
        delivery_address: 'House 10, Road 5, Gulshan',
        delivery_area: 'Gulshan',
        delivery_slot: 'Morning Dispatch (11:00 AM - 2:00 PM)',
        payment_method: 'cod',
      }),
    },
    tokenA
  );
  assert(orderRes.status === 201 && orderRes.json.ok, `POST /api/orders failed: ${orderRes.json.error?.message}`);
  assert(
    orderRes.json.data!.total_bdt === expectedCartTotal,
    `Order total ${orderRes.json.data!.total_bdt} != cart total ${expectedCartTotal}`
  );
  console.log(`✓ Demo order placed (${orderRes.json.data!.order_number}), total ৳${orderRes.json.data!.total_bdt}`);

  // 9. Verify User B cannot read User A's order
  const sbB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const anonB = await sbB.auth.signInAnonymously();
  assert(!anonB.error && anonB.data.session, 'User B anonymous sign-in failed');
  const orderIsolation = await api(`/orders/${orderRes.json.data!.id}`, {}, anonB.data.session.access_token);
  assert(orderIsolation.status === 404, `Expected 404 when User B requests User A order, got ${orderIsolation.status}`);
  console.log('✓ Per-user isolation verified: User B cannot read User A order');

  console.log('All KrishiKotha smoke checks passed!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
