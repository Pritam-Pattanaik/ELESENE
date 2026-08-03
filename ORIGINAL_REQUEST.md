# Original User Request

## Initial Request — 2026-07-21T15:51:40Z

ELESENE is a premium D2C women's fashion e-commerce platform (React 19 + Vite, Node/Express, PostgreSQL via Neon, Supabase Auth, Razorpay, deployed to Vercel). The entire codebase must be audited without mercy, every flaw fixed, and the result verified as genuinely production-ready — scoring a true 10/10 in every category.

Working directory: c:\ELESENE
Integrity mode: development

---

## Context: Current State of the Project

The project is **pre-production with critical blockers**. An internal audit (July 17, 2026) already identified 19 issues ranging from Critical to Low. The shopping/checkout flow is completely broken for all users. Several pages exist in code but are unreachable. Secrets are committed. Images do not persist. The following must all be verified and fixed.

---

## Requirements

### R1. Fix All Critical & High-Severity Bugs

Resolve every known critical and high-severity issue, verified by evidence:

1. **Auth token propagation** — `client/src/api/orders.js` reads `localStorage.getItem('token')` but customer JWT lives in Zustand under `elesene-customer-auth`. Fix token extraction so all authenticated API calls (cart, checkout, orders, addresses, wishlist) actually send the Bearer token. Verify by completing a checkout flow without a 401.

2. **No Razorpay webhook** — The backend must implement a `/api/payments/webhook` endpoint that verifies the Razorpay HMAC signature and promotes order status from `pending` → `paid` server-side. Client-side callback alone is insufficient (order stuck forever if browser closes mid-flow).

3. **IDOR on cart endpoints** — `updateCartItem` and `removeCartItem` in `cart.controller.js` must verify the cart item belongs to `req.user.id`. Any request attempting to modify another user's item must return 403.

4. **Razorpay key hardcoded** — Replace `'rzp_test_placeholder'` with a proper `VITE_RAZORPAY_KEY_ID` environment variable in checkout. Verify the env var is read at runtime, not baked in.

5. **Image persistence** — Multer `memoryStorage()` discards files on every restart. Migrate product image upload to Supabase Storage (or a persistent cloud bucket), ensuring images survive server restarts.

6. **Committed secrets** — Remove any `.env` files committed to git. Audit the git history and ensure no live DB connection strings, JWT secrets, or API keys remain in tracked files.

### R2. Wire All Broken Customer-Facing Flows

Every customer-facing page and feature must be connected to real data and real APIs — no mock data, no hardcoded fallbacks:

1. **Shop page (`/shop`)** — Replace `mockProducts` array with real `GET /api/products` call. Implement loading skeleton, error state, empty state, and pagination.

2. **Product detail page** — Remove hardcoded "Noir Velvet Evening Gown" fallback. Show real loading spinner while fetching; on API error, show a proper error UI with retry, never silently substitute fake data.

3. **Orphaned account routes** — Register `/account/profile`, `/account/orders`, `/account/addresses` in `main.jsx`. Each page must be route-guarded (redirect to login if unauthenticated) and fully functional against real API endpoints.

4. **Wishlist page** — Build a `WishlistPage` component, register it at `/account/wishlist`, and wire it to `GET /api/user/wishlist`. Support add/remove with optimistic updates.

5. **Checkout address selection** — Replace hardcoded `"Jane Doe, Mumbai"` address with a real address selector pulling from `/api/user/addresses`. Allow adding a new address inline.

6. **Coupon application** — Implement `POST /api/orders/apply-coupon` logic in `order.controller.js`. The checkout UI must send coupon code; the server must validate it (active, not expired, usage limit not reached, applicable to cart) and return the discounted total.

7. **Customer review submission** — Implement `POST /api/products/:id/reviews` endpoint (auth-gated, one review per user per product). Connect to a `ReviewForm` component on the product detail page.

### R3. Backend Hardening

1. **Sequelize migrations** — Replace `sequelize.sync({ alter: true })` on every boot with proper migration files (`npx sequelize-cli migration:create`). Schema changes must never auto-run against production DB.

2. **Rate limiting** — Apply `express-rate-limit` to at minimum: `POST /api/auth/login`, `POST /api/auth/register`, and `POST /api/payments/webhook`. Provide meaningful `Retry-After` headers on 429 responses.

3. **JWT revocation** — Add a `tokenVersion` (integer) column to the `Users` table. Increment it on password change or explicit logout. The `protect` middleware must reject tokens with a stale `tokenVersion`. Admin panel logout must invalidate the token server-side.

4. **Stock management** — `order.controller.js` must decrement `ProductVariant.stock_quantity` when an order is placed and restore it if the order is cancelled. If stock reaches 0 mid-checkout, return a 409 with a clear "out of stock" message.

5. **CORS** — Replace the wildcard `'*'` CORS origin in `api/index.js` with an explicit allowlist (`ALLOWED_ORIGINS` env var). In local dev the allowlist should include `localhost:5173`; in production, the Vercel domain only.

6. **Email verification & password reset** — Use the `is_verified` column. On registration, send a verification link (via Supabase Auth email or a transactional email service). Implement `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`.

### R4. UI/UX Premium Polish

Every page must feel world-class. Audit every screen and fix:

1. **Inconsistent design tokens** — Ensure Tailwind config defines a single shared spacing scale, color palette, border-radius set, and shadow set. No one-off `style={{}}` overrides that break consistency.

2. **Typography hierarchy** — Every page must have a clear `h1 → h2 → body → caption` hierarchy. No two adjacent elements at the same visual weight when they serve different information roles.

3. **Loading states** — Every data-dependent section must have a skeleton loader (not a spinner alone). Skeletons must match the shape of the content they replace.

4. **Empty states** — Every list (orders, wishlist, cart, search results) must have a branded empty state with an illustration or icon, headline, and CTA (never a blank page or raw "No items found" text).

5. **Error states** — Network errors must surface a human-readable message with a retry button. Never expose stack traces or raw API error JSON to the user.

6. **Mobile responsiveness** — Test every page at 320px, 375px, 390px, 768px, 1024px, 1440px. Fix overflow, clipping, broken grid, and unreadable text at every breakpoint.

7. **Animations** — All Framer Motion / GSAP animations must respect `prefers-reduced-motion`. Durations above 400ms must have a compelling reason. No janky layout shifts during page transitions.

8. **Accessibility** — Achieve WCAG 2.1 AA minimum: all interactive elements keyboard-navigable, all images have `alt` text, color contrast ≥ 4.5:1 for normal text, focus rings visible, all form inputs have associated `<label>` elements, all modals trap focus.

9. **Forms** — Login, register, checkout, and review forms must have inline validation (error shown beneath each field on blur), clear success feedback, and must disable the submit button while a request is in flight.

10. **Navigation** — Mobile nav must open/close smoothly, trap focus when open, and close on Escape key press.

### R5. Performance

1. Build the production bundle (`npm run build` in `client/`) and measure Lighthouse scores on the production-like bundle. **Target: LCP < 2.5 s, CLS < 0.1, TBT < 200 ms** on a simulated 4G connection.

2. Identify and remove any unused npm packages (`npm-check` or manual audit). Remove large static media (e.g., `Video_2_Frames` image sequence committed to git) that should be CDN-hosted.

3. Implement lazy-loading for all route-level components (`React.lazy` + `Suspense`).

4. Optimize all product images with modern formats (WebP) and `loading="lazy"` attributes.

### R6. Code Quality & Maintainability

1. **Dead code** — Delete unused files, unused imports, orphaned components, commented-out blocks.

2. **Duplication** — `api/index.js` and `server/src/index.js` share near-identical bootstrapping. Consolidate into a single shared entry or clearly document the two-environment contract.

3. **Documentation** — Update `DEVELOPERS.md` to reflect the final architecture, environment variables required (with descriptions), and how to run migrations.

4. **Environment variables** — Create a `.env.example` file documenting every required env var (for both `client/` and `server/`). Ensure `.gitignore` covers all real `.env` files.

---

## Acceptance Criteria

### Critical Bug Fixes
- [ ] A test account can complete a full checkout (add to cart → enter address → apply coupon → pay via Razorpay test mode → order status changes to `paid`) without any 401/403/500 errors
- [ ] Modifying another user's cart item (cross-user IDOR test) returns HTTP 403
- [ ] A product image uploaded via admin panel persists after the backend process restarts
- [ ] No `.env` file with real credentials appears in `git log --all -- .env` or `git log --all -- server/.env`
- [ ] Placing an order decrements `ProductVariant.stock_quantity` by the ordered quantity; attempting to order 1 unit of a 0-stock variant returns HTTP 409

### Working Customer Flows
- [ ] `/shop` renders real product data from the database (not `mockProducts`) with loading skeleton and error state
- [ ] `/product/:id` renders real product data; navigating to a non-existent product ID shows a 404 UI, not the "Noir Velvet Evening Gown" mock
- [ ] `/account/profile`, `/account/orders`, `/account/addresses`, `/account/wishlist` are all accessible via browser navigation and render real data
- [ ] A logged-in user can submit a review on a product they have not reviewed before; submitting a second review returns an error
- [ ] Applying a valid coupon code at checkout reduces the order total; applying an expired coupon returns a clear error message

### Backend Hardening
- [ ] `POST /api/auth/login` rate-limited: 10 requests/15 min from same IP, returns 429 with `Retry-After` header on breach
- [ ] Changing a user's password invalidates all previously issued JWTs for that user (token version check fails)
- [ ] `CORS` origin in production allows only the Vercel frontend domain (not `*`)
- [ ] Sequelize migrations directory exists with at least one migration file; `sequelize.sync({ alter: true })` is removed from production boot path
- [ ] Razorpay webhook endpoint verifies HMAC signature and rejects tampered payloads with 400

### UI Quality
- [ ] No page has an empty state that is a blank screen or raw "No items found" text
- [ ] No page has a loading state that is a blank screen (all have skeleton loaders)
- [ ] Form validation errors are visible inline, below the relevant field, before submission
- [ ] All pages render without horizontal overflow at 320px viewport width
- [ ] Lighthouse accessibility score ≥ 90 on the home page and shop page

### Performance
- [ ] Production Lighthouse LCP ≤ 2.5 s on simulated Fast 4G
- [ ] Lighthouse CLS < 0.1
- [ ] All route components are lazy-loaded (verified by chunk analysis in `dist/` — each route has its own chunk)

### Code Quality
- [ ] `npm run build` in `client/` completes with zero errors and zero warnings
- [ ] `.env.example` exists at both root and `server/` level, documents all required vars
- [ ] No `.env` file committed; `.gitignore` covers `*.env`, `.env.*` patterns
- [ ] `DEVELOPERS.md` includes a section on running migrations and required environment variables
