# ELESENE Changes Log

This document records the exact changes made to the codebase during development, tracking the transition from a prototype to a fully functional women's e-commerce storefront.

## Planned Changes
We have completed our codebase audit and have proposed a roadmap:

### Phase 1: Frontend & UI Fixes
- [x] **Auth Token Propagation:** Fix `getHeaders` in [orders.js](file:///c:/ELESENE/client/src/api/orders.js) to retrieve the token using `useCustomerAuthStore.getState().getToken()`.
- [x] **Route Registration:** Import and add routes for `/account/profile`, `/account/orders`, `/account/addresses` to [main.jsx](file:///c:/ELESENE/client/src/main.jsx).
- [x] **Wishlist Page:** Create `/wishlist` route and build the Wishlist page component.
- [x] **Real Shop Catalog:** Connect [ShopPage.jsx](file:///c:/ELESENE/client/src/pages/shop/ShopPage.jsx) to the real `useProducts` API hook. Remove the mock product grid.
- [x] **Product Details Error Fallback:** Update [ProductDetailPage.jsx](file:///c:/ELESENE/client/src/pages/product/ProductDetailPage.jsx) to show an error/not-found message if product retrieval fails instead of defaulting to a mock product.
- [x] **Checkout Address Selection:** Wire the real user addresses list into the checkout page.

### Phase 2: Supabase Integration
- [x] **Supabase Auth:** Add Supabase auth client on frontend and update the backend verification middleware.
- [x] **Supabase Storage:** Wire up file upload persistence using Supabase Storage buckets.

### Phase 3: Payments & Backend Logic
- [x] **Razorpay Payment Flow:** Ensure the frontend Razorpay payment window receives variables from the environment and the backend handles webhook verification.
- [x] **Coupon Logic:** Implement backend coupon validation during order initiation.
- [x] **Product Reviews:** Implement product review submission endpoint for customers.

---

## Log of Changes Made

### Phase 1: Frontend & UI Fixes
- **Auth Token Propagation Fix:** Modified `getHeaders()` in [orders.js](file:///c:/ELESENE/client/src/api/orders.js) to query the Zustand customer auth store (`useCustomerAuthStore.getState().token`) instead of checking `localStorage` directly for `'token'`. This ensures checkout and cart endpoints receive the shopper's authentication token correctly.
- **Route Registration:** Registered orphaned pages (`/account/profile`, `/account/orders`, `/account/addresses`) under the `AccountLayout` router nested path in [main.jsx](file:///c:/ELESENE/client/src/main.jsx). Also registered a new `/account/wishlist` nested path.
- **Wishlist Page Creation:** Created [WishlistPage.jsx](file:///c:/ELESENE/client/src/pages/account/WishlistPage.jsx) and connected it to the user API queries. It renders a premium grid displaying items saved in the customer's wishlist with actions to "Move to Bag" or remove items.
- **Order Retrieval API Export:** Exported `getUserOrders` in [orders.js](file:///c:/ELESENE/client/src/api/orders.js) so the customer order history page can pull real orders from the database.
- **Real Shop Catalog Integration:** Modified [ShopPage.jsx](file:///c:/ELESENE/client/src/pages/shop/ShopPage.jsx) to load products via the TanStack React Query hook `useProducts()` and categories via `useCategories()`. Built dynamic controls for search, category filter tabs, minimum/maximum price input fields, sorting selections, and paginated pagination controls. Handles relative image URLs dynamically and shows smooth enter/exit animations via framer-motion.
- **Product Details Fallback Removals:** Overwrote [ProductDetailPage.jsx](file:///c:/ELESENE/client/src/pages/product/ProductDetailPage.jsx) to remove hard-coded fallback products and variants. Introduced a custom "Product Not Found" screen with error messages and navigation controls when a query fails or the product slug does not exist in the database.
- **Checkout Address Selection & Form:** Updated [CheckoutPage.jsx](file:///c:/ELESENE/client/src/pages/checkout/CheckoutPage.jsx) to fetch the user's saved shipping addresses dynamically. Added a selectable address card layout, an inline address submission form to save new addresses via `addAddress()`, and ensured Razorpay checkout reads the public key from the environment.
- **Auth Redirect query support:** Added dynamic redirect support in [AuthPage.jsx](file:///c:/ELESENE/client/src/pages/auth/AuthPage.jsx) so customers trying to checkout unauthenticated are correctly redirected back to `/checkout` after signing in.
- **Custom Cursor Comfort Polish:** Overwrote [CustomCursor.jsx](file:///c:/ELESENE/client/src/components/effects/CustomCursor.jsx) to keep the native browser cursor fully visible and responsive, removing input lag discomfort. Streamlined custom elements to render only a smooth, trailing dashed gold ring and ambient glow trail following the native pointer.
- **Floating Pill Navbar Redesign:** Re-implemented [Navbar.jsx](file:///c:/ELESENE/client/src/components/layout/Navbar.jsx) to match the requested premium floating glass capsule layout. The design features:
  - Dynamic scroll scaling (contracts from `top-6 py-4.5` to `top-4 py-3.5` with backdrop-blur & shadows).
  - Serif brand logo with a custom gold uppercase brand message subtitle ("BE YOU. BE ELESENE.").
  - Centered navigation links (`Home`, `Collections`, `New Arrivals`, `Designers`, `Community`, `About`) with slide-in animation support.
  - Interactive search bar (collapses nav links to reveal a smooth inline text input).
  - Synchronized heart (wishlist) and shopping bag (cart) items count badges.
  - Interactive language selector (Globe dropdown) and a rounded solid bronze-gold `Join Now` CTA button.
  - **Background Video Visibility Fix:** Configured the floating capsule container to remain 100% transparent (`bg-transparent border-transparent shadow-none backdrop-blur-none`) at the top of the homepage. This keeps the background video fully visible and clear. The glass capsule morphs into view automatically only after the user scrolls down past the video (or on inner pages where a solid background is required for text readability).
  - **Absolute Centering Fix:** Wrapped the floating capsule container in a transparent, full-width flex overlay container (`flex justify-center`) inside the `<motion.header>` element. This solves translation and layout shift conflicts between Framer motion transform calculations and Tailwind CSS coordinates, ensuring the capsule navbar is perfectly and robustly centered at all times.
- **Mixed Model & Typography Scrolling Marquee:** Overwrote the scrolling marquee section in [HomePage.jsx](file:///c:/ELESENE/client/src/pages/home/HomePage.jsx) to feature 10 dynamic model product cards wearing ELESENE apparel (Silk Slip, Couture Coat, Linen Set, Party Edit, Resort Gown, Velvet Skirt, Tweed Jacket, etc.) interspersed with bold serif and italicized gold text blocks declaring "TRENDING NOW". Linked the horizontal position of the marquee to the user's scroll progress (using Framer motion's `useScroll` and `useTransform`), and reduced the typography and image card sizes to a delicate, luxury scale for enhanced readability.
- **Home Layout Pruning & Multi-Section Footer Overhaul:** Pruned home page layout by removing redundant sections (`AboutSection`, `TrendingCarousel`, `TestimonialSection`, `FAQSection`, and `BottomMarquee`), rendering the footer directly after the `GlamourDressesSection` as requested. Redesigned [Footer.jsx](file:///c:/ELESENE/client/src/components/layout/Footer.jsx) to implement the premium lookbook banner, brand value propositions feature grid, interactive `@ELESENE` Instagram showcase grid, newsletter registration form, organized client directory links, and checkout payment provider badges. Made the model walking video (`Woman_walking_on_city_street_202605051557.mp4`) the full-width background of the entire Lookbook section block at 100% opacity for maximum crispness, overlaying the lookbook details text on the left side over a smooth translucent gradient to guarantee readability while leaving the right-side video area fully clear and visible.
- **Mockup Replications (Categories & New Arrivals):** Created [CollectionsAndNewArrivals.jsx](file:///c:/ELESENE/client/src/components/home/CollectionsAndNewArrivals.jsx) and mounted it directly below `GlamourDressesSection` inside [HomePage.jsx](file:///c:/ELESENE/client/src/pages/home/HomePage.jsx). Replicated the exact styling of the user's PRD mockup:
  - **Explore Our Collections:** An ivory-based category showcase block (`Evening Wear`, `Bridal`, `Resort`, `Accessories`, `Pret-A-Porter`, and `Shoes`) with vertical preview grids, slide indicators, and hover transition sweeps.
  - **Just In:** A product showcase grid featuring the premium collection (`Silk Slip Dress`, `Velvet Evening Gown`, `Crystal Embellished Top`, `Noir Tailored Suit`, `Luxe Satin Dress`) detailed with original tags (`NEW`, `BESTSELLER`, `TRENDING`, `EXCLUSIVE`), interactively toggled heart wishlist triggers, and localized rupee currency values.
- **Creative Designers Showcase Section:** Created [DesignersSection.jsx](file:///c:/ELESENE/client/src/components/home/DesignersSection.jsx) to display ELESENE's design masterminds (`Elena Rostova`, `Siddharth Mehta`, `Clara Dupont`) alongside their bios, custom grayscale-to-color transition details, and entry animations. Linked the Designers navbar item directly to the homepage anchor container `/#designers-showcase` (with a reactive timeout scroll handler inside `HomePage.jsx` to smoothly glide to focus).
- **Client Dead-Code & Layout Cleanup:**
  - Removed unused Vite boilerplates `App.jsx` and `App.css` to streamline client builds.
  - Fixed brand nomenclature by replacing references to `Luxe Femme` with `ELESENE` inside [AboutPage.jsx](file:///c:/ELESENE/client/src/pages/about/AboutPage.jsx) and [ContactPage.jsx](file:///c:/ELESENE/client/src/pages/contact/ContactPage.jsx).
  - Wrapped [AccountLayout.jsx](file:///c:/ELESENE/client/src/pages/account/AccountLayout.jsx) with central layout components (Navbar, Footer, CartDrawer, and CustomCursor) to fix layout navigation in profile dashboard routes.
  - Removed "Explore" and "New Arrivals" links from navbar in [Navbar.jsx](file:///c:/ELESENE/client/src/components/layout/Navbar.jsx) as requested.
  - Added a premium, high-fashion model image banner at the top of the collections grid inside [ShopPage.jsx](file:///c:/ELESENE/client/src/pages/shop/ShopPage.jsx) that renders dynamically when sorting by "New Arrivals" (`sort === 'newest'`), displaying a stunning editorial image overlay.
  - Implemented `handleNavLinkClick` navigation click interceptor in [Navbar.jsx](file:///c:/ELESENE/client/src/components/layout/Navbar.jsx) and an interval-based hash scrolling observer in [HomePage.jsx](file:///c:/ELESENE/client/src/pages/home/HomePage.jsx) to ensure scrolling to page anchors (like designers showcase or home top) works perfectly even when clicking them repeatedly or when navigating between pages.
  - Added an active viewport section scroll listener in [Navbar.jsx](file:///c:/ELESENE/client/src/components/layout/Navbar.jsx) to track when the Designers section is in the viewport, shifting the gold underline style indicator dynamically between "Home" and "Designers" depending on scroll coordinates.









### Phase 2: Supabase Integration
- **Supabase Client Setup:** Created [supabase.js](file:///c:/ELESENE/client/src/supabase.js) in client codebase and configured it with env credentials.
- **Frontend Auth Refactor:** Modified [customerAuthStore.js](file:///c:/ELESENE/client/src/store/customerAuthStore.js) to perform registrations and sign-ins via Supabase Client. Sets token and maps user metadata formats.
- **Hybrid Verification Middleware:** Rewrote backend `protect` middleware in [auth.middleware.js](file:///c:/ELESENE/server/src/middleware/auth.middleware.js) to verify both custom JWTs and Supabase JWTs. Decodes claims, validates identity, and automatically replicates new Supabase users into the local PostgreSQL database to ensure relational constraints work seamlessly.
- **Supabase Storage Integration:** Configured backend [supabase.js](file:///c:/ELESENE/server/src/config/supabase.js) and rewrote `uploadProductImages` in [admin.controller.js](file:///c:/ELESENE/server/src/controllers/admin.controller.js) to upload Multer binary buffers to a `product-images` Supabase bucket when `SUPABASE_URL` is configured, updating saved database image URLs to their public Supabase CDN counterparts.

### Phase 3: Payments & Backend Logic
- **Razorpay Order & Webhook Reconciliation:** Created `handleRazorpayWebhook` inside [order.controller.js](file:///c:/ELESENE/server/src/controllers/order.controller.js) and registered it as an unauthenticated POST route in [order.routes.js](file:///c:/ELESENE/server/src/routes/order.routes.js). It verifies payload signatures using standard crypto HMAC validation, marks paid orders as confirmed, and decrements variant stock levels.
- **Order Business Logic Consolidation:** Abstracted payment fulfillment logic into a shared `completeOrderPayment` helper function inside [order.controller.js](file:///c:/ELESENE/server/src/controllers/order.controller.js) to eliminate duplicate logic between the client redirection verification and the webhook endpoint.
- **Stock & Inventory Safeguards:** Added stock availability verification during order initiation to prevent overselling of product variants.
- **Checkout Coupon Validation:** Added coupon lookup, expiry checks, usage limits, minimum order spend, and discount value calculation logic (for fixed and percentage models) when creating an order. Updates coupon usage counts upon payment completion.

### Phase 4: Wireframe Connectivity & Database Seeding
- **Category Query Parameter Sync:** Re-linked categories in `CollectionsAndNewArrivals.jsx` to navigate to `/shop?category=category-slug`. Refactored `ShopPage.jsx` using `useSearchParams` to read parameters and synchronize catalog filtering dynamically from URL query strings (supporting Category, Search, Price, Sort, and Page).
- **Backend Node Server & Database Seeding:** Created [seed-data.js](file:///c:/ELESENE/server/src/scripts/seed-data.js) to seed the database with all categories and products (including images and size/color variants matching the mockup). Spawned the Express backend server at port 3000 connecting to Neon PostgreSQL, syncing all models successfully.

- **Product Reviews & Verified Purchase Checks:** Created a review submission endpoint `/api/products/:id/reviews` in [product.routes.js](file:///c:/ELESENE/server/src/routes/product.routes.js) and [product.controller.js](file:///c:/ELESENE/server/src/controllers/product.controller.js). It validates rating bounds, accepts content, and checks whether the customer has a matching paid order for the product to toggle the `is_verified_purchase` flag.

### Phase 5: Production Environment Separation
- **Central Env Loader:** Created [server/src/config/env.js](file:///c:/ELESENE/server/src/config/env.js) to load `.env` in development and `.env.production` in production. Added startup logging showing active mode, Supabase URL, database status, and Razorpay key tier.
- **Production Env Files:** Created [server/.env.production](file:///c:/ELESENE/server/.env.production) and [client/.env.production](file:///c:/ELESENE/client/.env.production) as templates with placeholders for production credentials. Both are covered by `.gitignore`.
- **Updated Examples:** Updated [server/.env.example](file:///c:/ELESENE/server/.env.example) and [client/.env.example](file:///c:/ELESENE/client/.env.example) with production notes.
- **Startup Logging:** Modified [server/src/index.js](file:///c:/ELESENE/server/src/index.js) to log the active environment and Supabase URL at startup, preventing silent misconfiguration.
- **Docker Compose Production:** Updated [docker-compose.yml](file:///c:/ELESENE/docker-compose.yml) to mount `.env.production` files via `env_file` instead of hardcoding secrets.
- **Migration Script:** Created [server/src/scripts/migrate-to-production.js](file:///c:/ELESENE/server/src/scripts/migrate-to-production.js) to apply Sequelize migrations to a production database and verify all 14 tables exist with correct row counts.
- **Storage Setup Script:** Created [server/src/scripts/setup-production-storage.js](file:///c:/ELESENE/server/src/scripts/setup-production-storage.js) to create the `product-images` bucket, configure public read/5MB/MIME restrictions, apply RLS policies, and verify via upload test.
- **Isolation Verification Script:** Created [server/src/scripts/verify-isolation.js](file:///c:/ELESENE/server/src/scripts/verify-isolation.js) to confirm dev data does not leak into production and vice versa.
- **NPM Scripts:** Added `migrate:prod` and `setup:storage` scripts to [server/package.json](file:///c:/ELESENE/server/package.json).

### Phase 5: Production Deployment Verified (2026-08-03)
- **Production Supabase Project Created:** New project `gywmdazxqezgmbtengrz.supabase.co` created and verified as separate from dev.
- **Database Migrated:** Ran all 3 Sequelize migrations (`20260722000001-create-initial-schema`, `20260727000001-optimize-indexes`, `20260727000002-create-notifications-table`) on production. All 14 expected tables created with 0 rows.
- **Storage Configured:** Created `product-images` bucket with public read, 5MB limit, MIME restrictions (jpeg/png/webp/avif). RLS policies applied (Public Read, Service Role Full Access).
- **Environment Separation Confirmed:** Dev uses `.env` → dev Supabase (`qfqrywwmowadzwrykble`). Production uses `.env.production` → production Supabase (`gywmdazxqezgmbtengrz`).
- **Isolation Verified:** Production DB has 0 rows (no dev data). Dev DB has 35 users, 35 products, etc. (unchanged).

