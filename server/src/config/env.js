require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

if (process.env.NODE_ENV === 'production') {
  console.log(`[ENV] Production mode active`);
  console.log(`[ENV] Supabase URL: ${process.env.SUPABASE_URL || 'NOT SET'}`);
  console.log(`[ENV] Database: ${process.env.DATABASE_URL ? 'CONFIGURED' : 'NOT SET'}`);
  console.log(`[ENV] Razorpay: ${process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live') ? 'LIVE KEYS' : 'TEST KEYS / NOT SET'}`);
} else {
  console.log(`[ENV] Development mode active`);
  console.log(`[ENV] Supabase URL: ${process.env.SUPABASE_URL || 'NOT SET'}`);
}

module.exports = process.env;
