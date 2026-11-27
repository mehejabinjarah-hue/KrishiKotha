import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { optionalAuth, requireAuth } from './auth.js';
import { handleStandardBasket } from './handlers/baskets.js';
import {
  handleAddCartItem,
  handleApplyCoupon,
  handleClearCart,
  handleGetCart,
  handleRemoveCartItem,
  handleRemoveCoupon,
  handleUpdateCartItem,
} from './handlers/cart.js';
import { handleListCategories } from './handlers/categories.js';
import { handleGetFarmer, handleListFarmers } from './handlers/farmers.js';
import { handleHealth } from './handlers/health.js';
import { handleCreateInquiry } from './handlers/inquiries.js';
import { handleGetMe, handleUpdateMe } from './handlers/me.js';
import { handleGetOrder, handleListOrders, handlePlaceOrder } from './handlers/orders.js';
import { handleGetProduct, handleListProducts } from './handlers/products.js';
import { handleAddWishlist, handleListWishlist, handleRemoveWishlist } from './handlers/wishlist.js';
import {
  ApiError,
  applySecurityHeaders,
  getClientIp,
  readJsonBody,
  sendError,
  sendOk,
} from './http.js';
import { checkRateLimit } from './rateLimit.js';

function parseRequestUrl(req: IncomingMessage): { pathname: string; query: Record<string, string | undefined> } {
  const rawUrl = req.url || '/';
  const url = new URL(rawUrl, 'http://localhost');
  let pathname = url.pathname;
  if (!pathname.startsWith('/api')) {
    pathname = `/api${pathname.startsWith('/') ? '' : '/'}${pathname}`;
  }
  pathname = pathname.replace(/\/+$/, '') || '/';

  const query: Record<string, string | undefined> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  return { pathname, query };
}

export async function routeApiRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const requestId = randomUUID().slice(0, 8);
  applySecurityHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const method = (req.method || 'GET').toUpperCase();
    const { pathname, query } = parseRequestUrl(req);

    // Health
    if (method === 'GET' && pathname === '/api/health') {
      return sendOk(res, await handleHealth());
    }

    // Categories
    if (method === 'GET' && pathname === '/api/categories') {
      return sendOk(res, await handleListCategories());
    }

    // Products
    if (method === 'GET' && pathname === '/api/products') {
      return sendOk(res, await handleListProducts(query));
    }

    const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
    if (method === 'GET' && productMatch) {
      return sendOk(res, await handleGetProduct(decodeURIComponent(productMatch[1])));
    }

    // Farmers
    if (method === 'GET' && pathname === '/api/farmers') {
      return sendOk(res, await handleListFarmers());
    }

    const farmerMatch = pathname.match(/^\/api\/farmers\/([^/]+)$/);
    if (method === 'GET' && farmerMatch) {
      return sendOk(res, await handleGetFarmer(decodeURIComponent(farmerMatch[1])));
    }

    // Standard Basket
    if (method === 'GET' && pathname === '/api/baskets/standard') {
      return sendOk(res, await handleStandardBasket());
    }

    // Inquiries (public, rate-limited)
    if (method === 'POST' && pathname === '/api/inquiries') {
      const ip = getClientIp(req);
      const limit = checkRateLimit(`inquiries:${ip}`, 10, 60_000);
      if (!limit.allowed) {
        res.setHeader('Retry-After', String(limit.retryAfterSec));
        throw new ApiError(429, 'RATE_LIMITED', 'Too many submissions. Please wait a minute and try again.');
      }
      const auth = await optionalAuth(req);
      const body = await readJsonBody(req);
      return sendOk(res, await handleCreateInquiry(body, auth), 201);
    }

    // Protected routes below: always validate Bearer JWT
    if (pathname === '/api/me') {
      const auth = await requireAuth(req);
      if (method === 'GET') return sendOk(res, await handleGetMe(auth));
      if (method === 'PATCH') {
        const body = await readJsonBody(req);
        return sendOk(res, await handleUpdateMe(auth, body));
      }
    }

    // Cart
    if (pathname === '/api/cart') {
      const auth = await requireAuth(req);
      if (method === 'GET') return sendOk(res, await handleGetCart(auth));
      if (method === 'DELETE') return sendOk(res, await handleClearCart(auth));
    }

    if (pathname === '/api/cart/items' && method === 'POST') {
      const auth = await requireAuth(req);
      const body = await readJsonBody(req);
      return sendOk(res, await handleAddCartItem(auth, body), 201);
    }

    const cartItemMatch = pathname.match(/^\/api\/cart\/items\/([^/]+)$/);
    if (cartItemMatch) {
      const auth = await requireAuth(req);
      const itemId = decodeURIComponent(cartItemMatch[1]);
      if (method === 'PATCH') {
        const body = await readJsonBody(req);
        return sendOk(res, await handleUpdateCartItem(auth, itemId, body));
      }
      if (method === 'DELETE') {
        return sendOk(res, await handleRemoveCartItem(auth, itemId));
      }
    }

    if (pathname === '/api/cart/coupon') {
      const auth = await requireAuth(req);
      if (method === 'POST') {
        const body = await readJsonBody(req);
        return sendOk(res, await handleApplyCoupon(auth, body));
      }
      if (method === 'DELETE') {
        return sendOk(res, await handleRemoveCoupon(auth));
      }
    }

    // Wishlist
    if (pathname === '/api/wishlist') {
      const auth = await requireAuth(req);
      if (method === 'GET') return sendOk(res, await handleListWishlist(auth));
      if (method === 'POST') {
        const body = await readJsonBody(req);
        return sendOk(res, await handleAddWishlist(auth, body), 201);
      }
    }

    const wishlistMatch = pathname.match(/^\/api\/wishlist\/([^/]+)$/);
    if (wishlistMatch && method === 'DELETE') {
      const auth = await requireAuth(req);
      return sendOk(res, await handleRemoveWishlist(auth, decodeURIComponent(wishlistMatch[1])));
    }

    // Orders
    if (pathname === '/api/orders') {
      const auth = await requireAuth(req);
      if (method === 'GET') return sendOk(res, await handleListOrders(auth));
      if (method === 'POST') {
        const ip = getClientIp(req);
        const limit = checkRateLimit(`orders:${ip}`, 20, 60_000);
        if (!limit.allowed) {
          throw new ApiError(429, 'RATE_LIMITED', 'Too many order attempts. Please wait a moment.');
        }
        const body = await readJsonBody(req);
        return sendOk(res, await handlePlaceOrder(auth, body), 201);
      }
    }

    const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (orderMatch && method === 'GET') {
      const auth = await requireAuth(req);
      return sendOk(res, await handleGetOrder(auth, decodeURIComponent(orderMatch[1])));
    }

    return sendError(res, 404, 'ROUTE_NOT_FOUND', `No endpoint matches ${method} ${pathname}`);
  } catch (err) {
    if (err instanceof ApiError) {
      return sendError(res, err.status, err.code, err.message, err.details);
    }
    console.error(`[API Error][req=${requestId}]`, err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong on the server. Please try again.');
  }
}
