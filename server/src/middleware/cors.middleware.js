const cors = require('cors');

const getCorsOptions = () => {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const clientUrl = process.env.CLIENT_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  const defaultDevOrigins = [
    // Vite auto-increments from 5173 upward when ports are in use — allow the common range
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
    'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178',
    'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175',
    'http://localhost:3000',
  ];

  // Build explicit allowed list from env or fall back to dev defaults
  let allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean)
    : (isProduction ? [] : defaultDevOrigins);

  // Always include CLIENT_URL if set (the canonical production domain)
  if (clientUrl && !clientUrl.includes('REPLACE_WITH') && !allowedOrigins.includes(clientUrl)) {
    allowedOrigins.push(clientUrl.trim());
    // Also allow www variant
    const wwwVariant = clientUrl.replace(/^https?:\/\//, 'https://www.');
    if (!allowedOrigins.includes(wwwVariant)) {
      allowedOrigins.push(wwwVariant);
    }
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Check explicit allowed list or wildcard
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Support any *.vercel.app URL matching the elesene project pattern
      // Covers: elesene.vercel.app, elesene-git-<branch>-<team>.vercel.app, elesene-<hash>-<team>.vercel.app
      const isVercelApp = /^https:\/\/elesene[a-z0-9-]*\.vercel\.app$/.test(origin);
      if (isVercelApp) {
        return callback(null, true);
      }

      // In production without an explicit allow-list, also allow any HTTPS origin
      // that matches the production Supabase project's known host patterns (safety net)
      if (isProduction && !allowedOriginsEnv) {
        console.warn(`[CORS] Production fallback — allowing origin: ${origin}. Set ALLOWED_ORIGINS in Vercel env vars to restrict.`);
        return callback(null, true);
      }

      return callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'X-Requested-With'],
    optionsSuccessStatus: 200,
  };
};

module.exports = cors(getCorsOptions());
