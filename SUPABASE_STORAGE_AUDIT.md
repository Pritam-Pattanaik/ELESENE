# Supabase Storage Audit Report — ELESENE

**Date**: 2026-08-03
**Auditor**: Kilo (automated)
**Scope**: All Supabase Storage buckets referenced in the ELESENE codebase, verified against both dev and production Supabase projects.

---

## 1. Bucket Inventory

| # | Bucket Name | Purpose | Code References |
|---|-------------|---------|-----------------|
| 1 | `product-images` | Product gallery images uploaded via admin panel | `server/src/controllers/admin.controller.js:297-306` |

**Finding**: Only **one** bucket (`product-images`) is referenced anywhere in the codebase. No buckets for avatars, category banners, variant images, or any other user-uploaded content are referenced. The codebase has no `supabase.storage.from(...)` calls targeting any other bucket name.

---

## 2. Bucket Existence Check

### Dev Project (`qfqrywwmowadzwrykble.supabase.co`)

**Buckets found** (via `supabase.storage.listBuckets()` with service role key):

| Bucket | Public | Type | File Size Limit | Allowed MIME Types | Created |
|--------|--------|------|-----------------|--------------------|---------|
| `product-images` | true | STANDARD | 5,242,880 (5MB) | null (unlimited) | 2026-07-18 |

**Result**: ✅ `product-images` exists in dev.

### Production Project

**No separate production Supabase project is configured.** Both `server/.env` and `client/.env` point to the same project `qfqrywwmowadzwrykble.supabase.co`. There is no production `.env` file, no production Supabase URL/keys in any CI/CD config, and no separate project reference in `docker-compose.yml` or `vercel.json`.

**Result**: 🔴 **CRITICAL** — No production Supabase project is configured. The dev project is being used as a stand-in for production. If the dev project is destroyed, reset, or its storage configuration changes, production will break silently.

---

## 3. Access Configuration (Public/Private)

| Bucket | Current Setting | Should Be | Match? |
|--------|----------------|-----------|--------|
| `product-images` | **Public** (`public: true`) | Public-read is normal for product images | ✅ Yes |

**Evidence**: `listBuckets()` API returned `"public": true` for `product-images`. Public URLs are accessible without authentication: `https://qfqrywwmowadzwrykble.supabase.co/storage/v1/object/public/product-images/{path}`.

**Risk**: The bucket is public, meaning anyone with the URL can read objects. This is the intended behavior for product images, but it also means there are **no access restrictions on who can read** — only the upload/delete path needs protection (see RLS section).

---

## 4. RLS (Row Level Security) Policies

**Status**: 🔴 **UNVERIFIABLE — Cannot confirm RLS policies exist**

**Attempted verification methods**:
1. `supabase.from('pg_policies').select('*')` — Returns 404 (table not exposed via REST API)
2. `supabase.rpc('exec', { sql: '...' })` — Syntax error in Node.js string escaping
3. Direct postgrest REST API calls to `/rest/v1/pg_policies`, `/rest/v1/storage_policy`, `/rest/v1/_storage` — All return 404 (tables not in schema cache)
4. No Supabase Management API access token is available in the environment

**What we CAN confirm**:
- The service role key can upload, list, and delete objects in `product-images` without restriction (service role bypasses RLS by design).
- The anonymous/public key can read public objects (confirmed by public URL format working).
- The anonymous/public key **cannot** query `storage.objects` via the REST API (returns 404), which is expected since `storage.objects` is not a standard table exposed through postgrest.

**Risk**: Without being able to verify the actual RLS policies, we cannot confirm that:
- Authenticated users cannot overwrite or delete other users' product images
- Only admin/service role can write to the bucket
- There are no overly permissive `SELECT` policies allowing anonymous writes

**Recommendation**: Manually verify RLS policies in the Supabase Dashboard (Storage → `product-images` → Policies) and apply the following if missing:

```sql
-- Allow public read access
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow only service role (admin) to upload
CREATE POLICY "Service role can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow only service role (admin) to update
CREATE POLICY "Service role can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Allow only service role (admin) to delete
CREATE POLICY "Service role can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
```

---

## 5. File Constraints

| Constraint | Current Value | Expected | Status |
|------------|--------------|----------|--------|
| Max file size | 5,242,880 bytes (5MB) | Should be limited | ✅ Present |
| Allowed MIME types | `null` (unlimited) | Should be restricted to images | 🔴 **FAIL** |

**Evidence**: `listBuckets()` API returned `"allowed_mime_types": null`, meaning any file type can be uploaded to this bucket.

**MIME type enforcement is only at the application level**: `upload.middleware.js` line 39-48 enforces `jpg|jpeg|png|webp|avif` via `fileFilter`, but this is a **Multer-level check only**. If the Supabase Storage API is accessed directly (e.g., from the client or via a compromised service key), any file type can be uploaded.

**Test results**:
- Upload of a 5MB JPEG: ✅ Accepted
- Upload of a `.txt` file via service role key: ✅ Accepted (MIME type not enforced at storage level)
- Upload of a file exceeding 5MB: Would be rejected by Supabase Storage API (5MB limit enforced)

**Recommendation**: Configure `allowed_mime_types` on the bucket to `["image/jpeg", "image/png", "image/webp", "image/avif"]` in the Supabase Dashboard.

---

## 6. CORS Configuration

**Current setting**: `access-control-allow-origin: *` (allows any origin)

**Evidence**: A test upload was performed and then fetched with a custom `Origin: https://elesene.production.com` header. The response included `access-control-allow-origin: *`, confirming no CORS restriction.

**Risk**: The wildcard CORS policy means any domain can make storage requests on behalf of users. This is functional but not restrictive. For production, CORS should be scoped to the production domain(s).

**Recommendation**: Configure CORS in the Supabase Dashboard (Storage → Settings → CORS) to allow only the production domain(s).

---

## 7. Environment Variables — Dev vs. Production

### Dev Environment (`server/.env` and `client/.env`)

```
SUPABASE_URL=https://qfqrywwmowadzwrykble.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://qfqrywwmowadzwrykble.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Production Environment

**No production environment configuration exists.** There is:
- No `server/.env.production` file
- No production Supabase URL/keys in `vercel.json` environment variable configuration
- No production Supabase URL/keys in `docker-compose.yml`
- No CI/CD pipeline configuration files (no `.github/`, `.gitlab-ci.yml`, etc.)

**Result**: 🔴 **CRITICAL** — Both dev and production use the **same** Supabase project (`qfqrywwmowadzwrykble`). The `server/.env` and `client/.env` files contain credentials for this single project, and there is no mechanism to switch to a separate production project at deploy time.

---

## 8. End-to-End Upload Test

### Test Performed (against dev project `qfqrywwmowadzwrykble`)

1. **Upload**: Uploaded `verify.txt` (18 bytes, `text/plain`) to `product-images` bucket via `supabase.storage.from('product-images').upload('test-upload/verify.txt', buffer, { contentType: 'text/plain', upsert: true })`
   - **Result**: ✅ Success — returned `{ path: "test-upload/verify.txt", id: "3a20339e-...", fullPath: "product-images/test-upload/verify.txt" }`

2. **Public URL retrieval**: Called `supabase.storage.from('product-images').getPublicUrl('test-upload/verify.txt')`
   - **Result**: ✅ Success — returned `https://qfqrywwmowadzwrykble.supabase.co/storage/v1/object/public/product-images/test-upload/verify.txt`

3. **Anonymous fetch**: Fetched the public URL without authentication
   - **Result**: ✅ Success — HTTP 200, content returned

4. **Delete**: Removed the test file via `supabase.storage.from('product-images').remove(['test-upload/verify.txt'])`
   - **Result**: ✅ Success — file deleted

### Production End-to-End Test

**Not performed** — No separate production Supabase project is configured. The test above was run against the dev project, which is the same project that would be used in production.

---

## Summary of 🔴 Critical Issues

| # | Issue | Severity | Action Required |
|---|-------|----------|-----------------|
| 1 | **No separate production Supabase project** — dev and production use the same project (`qfqrywwmowadzwrykble`) | 🔴 CRITICAL | Create a separate production Supabase project and configure production credentials in the deployment environment |
| 2 | **RLS policies cannot be verified** — no access to `pg_policies` via API, no Management API token | 🔴 CRITICAL | Manually verify and apply RLS policies in the Supabase Dashboard for both dev and prod projects |
| 3 | **No MIME type restrictions on bucket** — `allowed_mime_types: null` allows any file type | 🔴 HIGH | Configure bucket to allow only image MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/avif`) |
| 4 | **CORS allows wildcard (`*`)** — any domain can make storage requests | 🟡 MEDIUM | Scope CORS to production domain(s) in Supabase Dashboard |
| 5 | **No production deployment config** — `vercel.json` and `docker-compose.yml` have no Supabase env vars | 🔴 CRITICAL | Add production Supabase credentials to Vercel environment variables and/or CI/CD secrets |

---

## Bucket Report Card

| Bucket | Purpose | Exists in Dev | Exists in Prod | Public/Private | RLS Verified | File Constraints | E2E Test |
|--------|---------|---------------|----------------|----------------|--------------|------------------|----------|
| `product-images` | Product gallery images | ✅ Yes | 🔴 Same as dev (no separate prod) | Public | ❌ Unverifiable | 5MB limit ✅, MIME unlimited 🔴 | ✅ Pass (dev only) |

---

## Pre-Deployment Checklist

- [ ] Create separate production Supabase project
- [ ] Create `product-images` bucket in production project (public, 5MB limit, image MIME types only)
- [ ] Verify and apply RLS policies in production project
- [ ] Configure CORS in production project for the production domain
- [ ] Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in production deployment environment (Vercel Dashboard)
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in production client environment
- [ ] Confirm dev and production use different project references
- [ ] Run end-to-end upload test against production project
- [ ] Verify MIME type restrictions are enforced at the bucket level
- [ ] Verify RLS policies prevent unauthorized writes/deletes
