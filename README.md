# KrishiKotha (কৃষিকথা) — From Farmers' Hands to Your Home

KrishiKotha is a mobile-first, farm-to-home grocery marketplace connecting verified smallholder farmers in Bangladesh (Bogura, Rajshahi, Rangpur, Dinajpur, Pabna) directly with households in Dhaka. Customers can browse morning-harvested produce with QR batch traceability, toggle between English and বাংলা (with Bangla numerals), build a 15%-off Weekly Basket, and test checkout using Guest, Email, or Google sign-in.

---

## How the Parts Connect

```text
  [Customer Browser]
   React + Vite + Tailwind
          │
          ├── Public Catalog & Auth ──────────────────────► [Supabase Auth + PostgreSQL]
          │                                                  (Row Level Security + RPCs)
          └── Protected API Calls (/api/*)
                     │
                     ▼
           [Vercel Serverless Router]
            api/[...path].ts → server/
            (Validates JWT, computes BDT totals, calls place_order)
```

---

## Step 1: Create a GitHub Account and Upload the Project

1. Go to **github.com** and click **Sign up** (or **Sign in** if you already have an account).
2. Click the **+** icon at the top-right → choose **New repository**.
3. Name it `krishikotha`, leave it **Public** or **Private**, and click **Create repository**.
4. Click **uploading an existing file** on the empty repository page → drag and drop all folders and files from this project (except `node_modules` and `dist` if present) → click **Commit changes**.
   - *Optional Git command alternative (if you have Git installed locally):*
     ```bash
     git init
     git add .
     git commit -m "Initial KrishiKotha website"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/krishikotha.git
     git push -u origin main
     ```
5. **What you should see:** All project folders (`api`, `server`, `shared`, `src`, `supabase`, `package.json`, `vercel.json`) listed inside your GitHub repository.

---

## Step 2: Create a Supabase Project

1. Go to **supabase.com** and sign in (you can sign in with your GitHub account).
2. Click **New project**.
3. Choose your organization → enter **Name:** `krishikotha` → create a strong **Database Password** (save it in a safe place) → choose **Region:** **Southeast Asia (Singapore)** (closest to Bangladesh) → click **Create new project**.
4. Wait 1–2 minutes while Supabase sets up your database.
5. **What you should see:** Your Supabase project dashboard with a green "Project is ready" status.

---

## Step 3: Run the Database Scripts

1. In your Supabase dashboard left sidebar, click **SQL Editor** → click **New query**.
2. Open `supabase/01_schema.sql` from this project, copy the entire file, paste it into the SQL Editor, and click **Run**.
   - **What you should see:** `Success. No rows returned`.
3. Click **New query** again → copy and paste the entire `supabase/02_rls_policies.sql` → click **Run**.
   - **What you should see:** `Success. No rows returned`.
4. Click **New query** again → copy and paste the entire `supabase/03_seed.sql` → click **Run**.
   - **What you should see:** `Success. No rows returned`.
5. In the left sidebar, click **Table Editor** → click **products**.
   - **What you should see:** 42 realistic produce items (Organic Deshi Tomato, Red Spinach, Himsagar Mango, etc.) along with 10 **categories** and 6 **farmers**.

*(Note: `supabase/99_reset_optional.sql` is only needed if you ever want to wipe all tables and start fresh. Do not run it normally.)*

---

## Step 4: Turn On Guest Access (Anonymous Sign-Ins)

1. In Supabase left sidebar, click **Authentication** → click **Sign In / Providers** (or **Settings** under Authentication).
2. Scroll to **Allow anonymous sign-ins** and toggle it **ON** → click **Save**.
3. *Abuse-prevention tip:* Later, you can also enable **Enable Captcha protection** (Turnstile or hCaptcha) in the same Authentication settings page to protect guest sign-ups against bots.
4. **What you should see:** Anonymous Sign-Ins enabled, allowing visitors to click **Continue as Guest** immediately.

---

## Step 5: Email Sign-In Settings

1. In Supabase → **Authentication** → **Sign In / Providers** → **Email**:
   - Email provider is enabled by default.
   - **Confirm email** is ON by default (new users receive a verification link before signing in). For faster testing, you can temporarily toggle **Confirm email** OFF → **Save**.
   - Note that Supabase's built-in email sender on the free tier has a low hourly limit (~2–4 emails/hour); for live launch, configure a custom SMTP provider in **Project Settings → Authentication**.
2. **What you should see:** Email & password registration, login, and "Forgot password" reset emails working.

---

## Step 6: Copy Your Supabase Keys

1. In Supabase left sidebar, click **Project Settings** (gear icon) → **API** (or **Data API / API Keys**).
2. Copy these two values:
   - **Project URL** (looks like `https://abcdefghijkl.supabase.co`)
   - **anon / public** key (safe for the browser because Row Level Security protects every table)
3. **CRITICAL SECURITY WARNING:** Never copy or share the `service_role` secret key! This project is intentionally built so `service_role` is **not needed at all**.
4. **What you should see:** Your Project URL and `anon` public key ready to paste into Vercel.

---

## Step 7: Deploy to Vercel

1. Go to **vercel.com** and sign in with GitHub.
2. Click **Add New…** → **Project** → find your `krishikotha` repository → click **Import**.
3. Under **Framework Preset**, verify **Vite** is selected.
4. Open **Environment Variables** and add these 4 variables (using the values from Step 6):
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase `anon` public key
   - `SUPABASE_URL` = your Supabase Project URL
   - `SUPABASE_ANON_KEY` = your Supabase `anon` public key
5. Click **Deploy** and wait ~1 minute.
6. Copy your new live URL (e.g. `https://krishikotha.vercel.app`).
7. **What you should see:** A "Congratulations!" screen and a working live website without the yellow "DEMO PREVIEW" banner.

---

## Step 8: Tell Supabase Your Live URL

1. Return to Supabase → **Authentication** → **URL Configuration**.
2. Set **Site URL** to your live Vercel URL (e.g. `https://krishikotha.vercel.app`).
3. Under **Redirect URLs**, click **Add URL** and add:
   - `https://YOUR-SITE.vercel.app/**`
   - `http://localhost:3000/**`
   - `http://localhost:5173/**`
4. Click **Save**.
5. **What you should see:** Redirects from email confirmation, password reset, and Google sign-in land cleanly back on your live site.

---

## Step 9: Set Up "Continue with Google" (Optional)

*(Note: Guest and Email sign-in already work without this step.)*

1. Go to **console.cloud.google.com** → create a new project (e.g. `KrishiKotha`).
2. Go to **APIs & Services → OAuth consent screen** → choose **External** → fill in App name `KrishiKotha` and your email → Save.
3. Go to **APIs & Services → Credentials** → **Create Credentials → OAuth client ID** → Application type: **Web application**.
4. In Supabase → **Authentication → Providers → Google**, copy the **Callback URL (for OAuth)** (looks like `https://YOUR-PROJECT.supabase.co/auth/v1/callback`).
5. Paste that Callback URL into Google Cloud's **Authorized redirect URIs** → click **Create**.
6. Copy the **Client ID** and **Client Secret** from Google Cloud into Supabase → **Authentication → Providers → Google**, toggle **Enable Sign in with Google** ON, and click **Save**.
7. **What you should see:** Clicking **Continue with Google** on `/login` signs users in cleanly.

---

## Step 10: Test Your Live Site Checklist

1. Open your Vercel URL: verify no yellow "DEMO PREVIEW" banner appears, and footer shows **Status: Connected to Supabase**.
2. Browse products, toggle **EN | বাংলা** (prices switch between `৳65` and `৳৬৫`), and search for "tomato".
3. Click **Add** on a product → click **Continue as Guest** → verify the item is added and stays in your basket after refreshing the page.
4. Click the heart icon to save an item to Wishlist, then visit `/wishlist`.
5. Go to `/cart`, add 4+ distinct vegetables or try coupon `KRISHI100` (valid on ৳799+ after basket discount).
6. Proceed to `/checkout`, submit a demonstration order, and verify `/order-confirmation/...` shows your order number (`KK-YYYYMMDD-####`).
7. Visit `/account` → confirm your order appears in Order History.
8. Sign out, sign back in with an email or Google account, or upgrade a guest session from `/account`.

---

## Step 11: Optional — Run Locally

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
npm run dev
```

Open `http://localhost:3000`. To run the API smoke test against your local server:

```bash
npm run smoke
```

---

## Step 12: Button → Endpoint Wiring Reference

| UI Action / Button | Frontend Caller | Backend Endpoint / DB Action |
|---|---|---|
| Load homepage / shop / filters | `apiClient.getProducts` | `GET /api/products` |
| Load category counts | `apiClient.getCategories` | `GET /api/categories` |
| Open product page | `apiClient.getProduct` | `GET /api/products/:slug` |
| Load farmer stories | `apiClient.getFarmers` | `GET /api/farmers` |
| Standard Weekly Basket | `apiClient.getStandardBasket` | `GET /api/baskets/standard` |
| Add to Basket / Cart | `apiClient.addCartItem` | `POST /api/cart/items` |
| Stepper `+` / `−` in cart | `apiClient.updateCartItem` | `PATCH /api/cart/items/:id` |
| Remove cart item | `apiClient.removeCartItem` | `DELETE /api/cart/items/:id` |
| Apply coupon (`KRISHI100`) | `apiClient.applyCoupon` | `POST /api/cart/coupon` |
| Heart / Save wishlist | `apiClient.addWishlist` / `removeWishlist` | `POST /api/wishlist` / `DELETE /api/wishlist/:productId` |
| Place Demonstration Order | `apiClient.placeOrder` | `POST /api/orders` → Postgres `place_order` RPC |
| Order History / Detail | `apiClient.getOrders` / `getOrder` | `GET /api/orders` / `GET /api/orders/:id` |
| Save Profile | `apiClient.updateMe` | `PATCH /api/me` |
| Contact / Seller / Community forms | `apiClient.submitInquiry` | `POST /api/inquiries` |

---

## Step 13: Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Yellow **DEMO PREVIEW** banner still showing | Vercel or `.env.local` missing `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Add all 4 env vars in Vercel → **Redeploy** |
| 401 errors on cart or checkout | User not signed in, or `SUPABASE_URL`/`SUPABASE_ANON_KEY` missing on server | Click **Continue as Guest**; verify server env vars in Vercel |
| "Guest sign-in is disabled" | Anonymous Sign-Ins not turned on in Supabase | Supabase → Authentication → Sign In / Providers → enable **Anonymous Sign-Ins** |
| Google redirect mismatch | Missing Supabase callback URL in Google Cloud or missing Vercel URL in Supabase | Repeat Steps 8 & 9 carefully |
| 404 when refreshing `/product/deshi-tomato` | Rewrite missing or static route misconfigured | Ensure `vercel.json` is committed at the repo root |
| Images show cream placeholder | Missing image file or invalid external URL | In Supabase **Table Editor → products**, set `image_url` to a valid image path or hosted URL |

---

## Step 14: Security & Updating Products

- **Assumptions:** Coupon `KRISHI100` gives ৳100 off when subtotal after weekly basket discount is `≥ ৳799`. Delivery is `৳60` below `৳799` and free at `≥ ৳799`.
- **Guest upgrade behaviour:** When a guest creates an email account or links Google from the guest session, Supabase keeps the same user ID so the basket, wishlist, and past orders stay intact. If the Google account already exists, the app falls back to signing into that existing account.
- **Updating products & images later:** Open Supabase → **Table Editor** → `products` or `product_variants` to edit names, `price_bdt` (always whole Taka integers), `stock_qty`, or `image_url`.
- **Security:** Never put `SUPABASE_SERVICE_ROLE_KEY` in `VITE_*` variables or commit `.env` files to GitHub.

---

## Step 15: Test Status

| Check | Status | Notes |
|---|---|---|
| Install (`npm install`) | ✅ Verified by running | Packages installed cleanly |
| Typecheck (`npm run typecheck`) | ✅ Verified by running | Strict TypeScript check passes |
| Lint (`npm run lint`) | ✅ Verified by running | Passes cleanly |
| Build (`npm run build`) | ✅ Verified by running | Vite production bundle + asset copy passes |
| Unit tests (`npm run test`) | ✅ Verified by running | Vitest pricing, schema & BDT format tests pass |
| API Smoke test (`npm run smoke`) | ⚠️ Not run: needs your accounts | Run after configuring Supabase keys |
| Live Supabase / Auth / Vercel | ⚠️ Not run: needs your accounts | Follow Steps 2–10 above |
