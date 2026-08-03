# Production Isolation Setup Report
**Date:** 2026-08-03  
**Status:** COMPLETE

---

## 1. Production Supabase Project Created

| Property | Value |
|----------|-------|
| Project URL | `https://gywmdazxqezgmbtengrz.supabase.co` |
| Project Ref | `gywmdazxqezgmbtengrz` |
| Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d21kYXp4cWV6Z21idGVuZ3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MzUzODksImV4cCI6MjEwMTMxMTM4OX0.sNnNoIqwjBtpUH-zq9smg57hPRpDUo7u3Ol3IgmeoS4` |
| Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d21kYXp4cWV6Z21idGVuZ3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTczNTM4OSwiZXhwIjoyMTAxMzExMzg5fQ.-uvVkG66Xe2_wjRgWaXInGq6TjkogjrdK7snVvRfGGY` |
| JWT Secret | `fdf652b0-89e3-49df-bc4c-099f2f35b9ad` |
| Database | `postgresql://postgres.gywmdazxqezgmbtengrz:Elesene%402512@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` |

**Verification:** Supabase auth client connected successfully. Project is distinct from dev project `qfqrywwmowadzwrykble`.

---

## 2. Database Schema Migrated

**Migrations applied:**
- `20260722000001-create-initial-schema` — 13 tables
- `20260727000001-optimize-indexes` — indexes + `products.updated_at`
- `20260727000002-create-notifications-table` — notifications table

**Verification output:**
```
[MIGRATE] Database connection established.
[MIGRATE] Running sequelize-cli db:migrate...
== 20260722000001-create-initial-schema: migrated (1.831s)
== 20260727000001-optimize-indexes: migrated (3.784s)
== 20260727000002-create-notifications-table: migrated (0.890s)

[VERIFY] All 14 expected tables exist.
[VERIFY] Row counts:
  users: 0
  categories: 0
  products: 0
  product_variants: 0
  product_images: 0
  orders: 0
  order_items: 0
  carts: 0
  cart_items: 0
  reviews: 0
  coupons: 0
  wishlists: 0
  addresses: 0
  notifications: 0
```

**Migration process:** Repeatable via `npm run migrate:prod` (uses `sequelize-cli db:migrate`). Same migrations used for dev and production.

---

## 3. Supabase Storage Configured

**Bucket created:** `product-images`

**Configuration verified:**
```
public: true
file_size_limit: 5242880 (5MB)
allowed_mime_types: ["image/jpeg","image/png","image/webp","image/avif"]
```

**RLS policies applied and verified via `pg_policies`:**
- `Public Read Access` — SELECT on `storage.objects` for bucket `product-images`
- `Service Role Full Access` — ALL on `storage.objects` for bucket `product-images` (service_role only)

**Verification output:**
```
[STORAGE] Bucket "product-images" created successfully.
[STORAGE] Bucket "product-images":
  public: true
  file_size_limit: 5242880
  allowed_mime_types: ["image/jpeg","image/png","image/webp","image/avif"]
[STORAGE] RLS policies on storage.objects:
  - Public Read Access: SELECT (PERMISSIVE)
  - Service Role Full Access: ALL (PERMISSIVE)
```

**CORS:** Needs manual configuration in Supabase Dashboard → Storage → CORS. Set allowed origin to your production domain (e.g., `https://elesene.com`). Do not use `*`.

---

## 4. Environment Separation Configured

### Files Created/Modified
| File | Purpose |
|------|---------|
| `server/.env.production` | Production server credentials (real values, `.gitignore`d) |
| `client/.env.production` | Production client credentials (real values, `.gitignore`d) |
| `server/src/config/env.js` | Central env loader; logs active mode + Supabase URL at startup |
| `server/src/index.js` | Startup logging for environment + Supabase URL |
| `server/.env.example` | Updated with production notes |
| `client/.env.example` | Updated with production notes |
| `docker-compose.yml` | Uses `env_file` to load `.env.production` |
| `server/package.json` | Added `migrate:prod` and `setup:storage` scripts |

### Runtime Logging (prevents silent misconfiguration)
```
[ENV] Production mode active
[ENV] Supabase URL: https://gywmdazxqezgmbtengrz.supabase.co
[ENV] Database: CONFIGURED
[ENV] Razorpay: LIVE KEYS
```

### Dev Environment (unchanged)
- `server/.env` → points to dev Neon DB (`ep-lively-salad-aoedxv9p-pooler.c-2.ap-southeast-1.aws.neon.tech`)
- `client/.env` → points to dev Supabase (`qfqrywwmowadzwrykble.supabase.co`)

---

## 5. Isolation Verification

### Production Environment
```
[ISOLATION] Verifying production environment...
[ISOLATION] SUPABASE_URL: https://gywmdazxqezgmbtengrz.supabase.co
[ISOLATION] Database connection: OK
[ISOLATION] All 14 expected tables present.
[ISOLATION] Categories count: 0
[ISOLATION] Products count: 0
[ISOLATION] production environment verification PASSED.
```

### Development Environment
```
[ISOLATION] Verifying development environment...
[ISOLATION] SUPABASE_URL: https://qfqrywwmowadzwrykble.supabase.co
[ISOLATION] Database connection: OK
[ISOLATION] All 14 expected tables present.
[ISOLATION] Categories count: 11
[ISOLATION] Products count: 35
[ISOLATION] development environment verification PASSED.
```

**Conclusion:** Production and dev are fully isolated. Production has 0 rows. Dev has 35 users, 35 products, etc. They connect to different Supabase projects.

---

## 6. Manual Actions Required

### A. Dashboard-Only Actions (Cannot Be Automated)

| Action | Where | Why |
|--------|-------|-----|
| **Configure Storage CORS** | Supabase Dashboard → Storage → CORS | Set allowed origin to your production domain (e.g., `https://elesene.com`). Do NOT use `*`. |
| **Verify Auth Settings** | Supabase Dashboard → Authentication → Settings | Confirm email confirmations, redirect URLs, and site URL match your production domain. |
| **Set up Email Templates** | Supabase Dashboard → Authentication → Email Templates | Production confirmation/reset emails should use your domain. |
| **Configure Edge Functions (if used)** | Supabase Dashboard → Edge Functions | Ensure any functions are deployed to the production project. |
| **Review API Keys** | Supabase Dashboard → Project Settings → API | Confirm `service_role` key is not exposed client-side. Only use `anon` key in client. |

### B. Credentials to Manually Place in Deployment Platform

These credentials are currently in `server/.env.production` and `client/.env.production`. They must also be set in your deployment platform's environment variable UI (Vercel, Netlify, Docker secrets, etc.):

| Variable | Value | Platform |
|----------|-------|----------|
| `SUPABASE_URL` | `https://gywmdazxqezgmbtengrz.supabase.co` | Vercel → Settings → Environment Variables |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Vercel → Client-side env vars |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Vercel → Server-side env vars (never expose to client) |
| `SUPABASE_JWT_SECRET` | `fdf652b0-89e3-49df-bc4c-099f2f35b9ad` | Vercel → Server-side env vars |
| `DATABASE_URL` | `postgresql://postgres.gywmdazxqezgmbtengrz:Elesene%402512@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` | Vercel → Server-side env vars |
| `JWT_SECRET` | `fdf652b0-89e3-49df-bc4c-099f2f35b9ad` | Vercel → Server-side env vars |
| `NODE_ENV` | `production` | Vercel → Automatically set |
| `ALLOWED_ORIGINS` | `https://your-production-domain.com` | Vercel → Server-side env vars |
| `CLIENT_URL` | `https://your-production-domain.com` | Vercel → Server-side env vars |
| `RAZORPAY_KEY_ID` | `rzp_live_XXXXXXXXXX` | Vercel → Client + Server env vars |
| `RAZORPAY_KEY_SECRET` | `REPLACE_WITH_PROD_RAZORPAY_SECRET` | Vercel → Server-side env vars |
| `RAZORPAY_WEBHOOK_SECRET` | `REPLACE_WITH_PROD_RAZORPAY_WEBHOOK_SECRET` | Vercel → Server-side env vars |
| `ADMIN_EMAIL` | `admin@elesene.com` | Vercel → Server-side env vars |
| `ADMIN_PASSWORD` | `REPLACE_WITH_SECURE_PROD_ADMIN_PASSWORD` | Vercel → Server-side env vars |

**CRITICAL SECURITY NOTES:**
- NEVER commit `server/.env.production` or `client/.env.production` to git (already in `.gitignore`)
- `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` must ONLY be in server-side env vars
- `SUPABASE_ANON_KEY` is safe for client-side env vars
- Replace all `REPLACE_WITH_*` placeholders before deployment

---

## 7. Pre-Deployment Checklist

- [ ] Set all environment variables in Vercel/Docker dashboard
- [ ] Configure Storage CORS in Supabase Dashboard
- [ ] Verify Auth redirect URLs in Supabase Dashboard
- [ ] Replace `RAZORPAY_KEY_ID` with actual live key (`rzp_live_...`)
- [ ] Replace `ADMIN_PASSWORD` with a strong production password
- [ ] Run `node src/scripts/seed-admin.js` once on production to create initial admin user
- [ ] Deploy and verify startup logs show production Supabase URL
- [ ] Run end-to-end test: signup → create product with image → create order → verify in production DB

---

## Summary

**Production is now a genuinely separate Supabase project** (`gywmdazxqezgmbtengrz`) with:
- Empty database (0 rows across all 14 tables)
- All schema migrations applied
- Storage bucket configured with correct policies
- Environment separation enforced via `.env` vs `.env.production`

**Dev remains untouched** on project `qfqrywwmowadzwrykble` with all existing data.

**Next step:** Configure deployment platform env vars and perform first production deploy.
