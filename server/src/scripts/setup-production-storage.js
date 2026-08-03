/**
 * Supabase Storage setup script for production.
 *
 * This script:
 * 1. Creates the `product-images` bucket if it does not exist
 * 2. Sets public read access, 5MB file size limit, and allowed MIME types
 * 3. Creates RLS policies on storage.objects:
 *    - public SELECT
 *    - INSERT/UPDATE/DELETE restricted to service_role
 * 4. Verifies bucket and policies exist
 *
 * Usage:
 *   node src/scripts/setup-production-storage.js
 *
 * Prerequisites:
 * - server/.env.production must contain valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

require('../config/env');
const { createClient } = require('@supabase/supabase-js');
const sequelize = require('../config/db');

const BUCKET_NAME = 'product-images';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

async function setupStorage() {
  console.log(`\n[STORAGE] Setting up Supabase Storage for production...`);
  console.log(`[STORAGE] Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(`[STORAGE] Bucket: ${BUCKET_NAME}`);

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[STORAGE] FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1: Ensure bucket exists
  console.log('\n[STORAGE] Step 1: Checking bucket existence...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('[STORAGE] Failed to list buckets:', listError.message);
    process.exit(1);
  }

  const existing = buckets?.find(b => b.name === BUCKET_NAME);

  if (existing) {
    console.log(`[STORAGE] Bucket "${BUCKET_NAME}" already exists. Updating configuration...`);
    const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    });

    if (updateError) {
      console.error('[STORAGE] Failed to update bucket:', updateError.message);
      process.exit(1);
    }
    console.log('[STORAGE] Bucket updated successfully.');
  } else {
    console.log(`[STORAGE] Bucket "${BUCKET_NAME}" does not exist. Creating...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    });

    if (createError) {
      console.error('[STORAGE] Failed to create bucket:', createError.message);
      process.exit(1);
    }
    console.log('[STORAGE] Bucket created successfully.');
  }

  // Step 2: Verify bucket config
  console.log('\n[STORAGE] Step 2: Verifying bucket configuration...');
  const { data: verifiedBucket, error: verifyError } = await supabase.storage.getBucket(BUCKET_NAME);

  if (verifyError || !verifiedBucket) {
    console.error('[STORAGE] Failed to verify bucket:', verifyError?.message || 'not found');
    process.exit(1);
  }

  console.log(`[STORAGE] Bucket "${verifiedBucket.name}":`);
  console.log(`  public: ${verifiedBucket.public}`);
  console.log(`  file_size_limit: ${verifiedBucket.file_size_limit}`);
  console.log(`  allowed_mime_types: ${JSON.stringify(verifiedBucket.allowed_mime_types)}`);

  // Step 3: Set up RLS policies via SQL
  console.log('\n[STORAGE] Step 3: Setting up RLS policies...');

  const policyQueries = [
    // Drop existing policies if they exist (idempotent)
    `DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;`,
    `DROP POLICY IF EXISTS "Service Role Full Access" ON storage.objects;`,

    // Public read access
    `CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = '${BUCKET_NAME}');`,

    // Service role can insert/update/delete
    `CREATE POLICY "Service Role Full Access" ON storage.objects FOR ALL TO service_role USING (bucket_id = '${BUCKET_NAME}') WITH CHECK (bucket_id = '${BUCKET_NAME}');`,
  ];

  for (const query of policyQueries) {
    try {
      await sequelize.query(query);
      console.log(`[STORAGE] Executed: ${query.substring(0, 80)}...`);
    } catch (e) {
      console.error(`[STORAGE] Failed to execute policy SQL: ${e.message}`);
      console.error(`  Query: ${query}`);
    }
  }

  // Step 4: Verify policies exist by querying pg_policy
  console.log('\n[STORAGE] Step 4: Verifying policies via database query...');
  try {
    const [policies] = await sequelize.query(
      `SELECT policyname, permissive, cmd, qual, with_check FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';`
    );

    if (policies.length === 0) {
      console.warn('[STORAGE] WARNING: No RLS policies found on storage.objects. Policies may need to be applied via Supabase Dashboard SQL Editor if direct SQL execution is restricted.');
    } else {
      console.log('[STORAGE] RLS policies on storage.objects:');
      policies.forEach(p => {
        console.log(`  - ${p.policyname}: ${p.cmd} (${p.permissive})`);
      });
    }
  } catch (e) {
    console.warn('[STORAGE] Could not query pg_policies:', e.message);
    console.warn('[STORAGE] This may happen if the database user lacks permissions. Verify policies manually in Supabase Dashboard -> Storage -> Policies.');
  }

  // Step 5: Verify bucket and policies via Supabase client
  console.log('\n[STORAGE] Step 5: Verifying upload capability...');
  const testContent = Buffer.from('test-verification');
  const testPath = `.verify/${Date.now()}.txt`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(testPath, testContent, { contentType: 'text/plain', upsert: true });

  if (uploadError) {
    console.error('[STORAGE] Upload test failed:', uploadError.message);
  } else {
    console.log(`[STORAGE] Upload test succeeded: ${uploadData?.path}`);
    // Cleanup
    await supabase.storage.from(BUCKET_NAME).remove([testPath]);
    console.log('[STORAGE] Cleaned up test file.');
  }

  console.log('\n[STORAGE] Storage setup complete.\n');
}

setupStorage().catch(err => {
  console.error('[STORAGE] Fatal error:', err);
  process.exit(1);
});
