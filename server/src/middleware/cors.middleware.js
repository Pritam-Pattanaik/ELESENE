const cors = require('cors');

const getCorsOptions = () => {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const defaultDevOrigins = [
    // Vite auto-increments from 5173 upward when ports are in use — allow the common range
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
    'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178',
    'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175',
    'http://localhost:3000',
  ];
  
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean)
    : defaultDevOrigins;

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, cURL, server-to-server)
      if (!origin) return callback(null, true);

      // Check if origin is in explicit allowed list or wildcard is set
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Support Vercel preview deployment URLs dynamically
      const isVercelPreview = /^https:\/\/elesene-.*\.vercel\.app$/.test(origin);
      if (isVercelPreview) {
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
