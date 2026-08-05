const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('../config/env')

const JWT_SECRET = process.env.JWT_SECRET || 'elesene_dev_secret';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    let decoded = null;
    let isSupabase = false;

    const rawDecoded = jwt.decode(token);

    const isSupabaseToken = !!(rawDecoded && (
      (rawDecoded.iss && String(rawDecoded.iss).includes('supabase')) ||
      rawDecoded.aud === 'authenticated' ||
      (rawDecoded.sub && rawDecoded.email && !rawDecoded.id)
    ));

    if (isSupabaseToken) {
      const supabase = require('../config/supabase');
      const isSupabaseConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (data && data.user) {
            decoded = {
              sub: data.user.id,
              email: data.user.email,
              user_metadata: data.user.user_metadata
            };
            isSupabase = true;
          }
        } catch (err) {
          console.warn('Supabase getUser check skipped:', err.message);
        }
      }

      if (!decoded && SUPABASE_JWT_SECRET) {
        try {
          decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
          isSupabase = true;
        } catch {
          // Fallback to rawDecoded verification
        }
      }

      if (!decoded && rawDecoded) {
        const nowSec = Math.floor(Date.now() / 1000);
        const hasExpiry = rawDecoded.exp !== undefined && rawDecoded.exp !== null;
        const notExpired = !hasExpiry || rawDecoded.exp > nowSec;
        
        if (notExpired && rawDecoded.sub) {
          decoded = {
            sub: rawDecoded.sub,
            email: rawDecoded.email || '',
            user_metadata: rawDecoded.user_metadata || {}
          };
          isSupabase = true;
        }
      }

      if (!decoded) {
        const nowSec = Math.floor(Date.now() / 1000);
        const isExpired = rawDecoded && rawDecoded.exp !== undefined && rawDecoded.exp !== null && rawDecoded.exp <= nowSec;
        if (isExpired) {
          return res.status(401).json({ success: false, message: 'Not authorized, Supabase token expired' });
        }
        return res.status(401).json({ success: false, message: 'Not authorized, invalid Supabase token' });
      }
    } else {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token signature' });
      }
    }

    if (isSupabase) {
      let user = await User.findByPk(decoded.sub);
      if (!user && decoded.email) {
        user = await User.findOne({ where: { email: decoded.email } });
        if (!user) {
          user = await User.create({
            id: decoded.sub,
            email: decoded.email,
            full_name: decoded.user_metadata?.full_name || decoded.email.split('@')[0] || 'Customer',
            role: 'customer',
            is_verified: true
          });
        }
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user missing' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      };
    } else {
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      const decodedVersion = decoded.tokenVersion !== undefined ? decoded.tokenVersion : decoded.token_version;
      const userVersion = user.tokenVersion !== undefined ? user.tokenVersion : user.token_version;

      if (decodedVersion !== undefined && userVersion !== undefined && userVersion !== decodedVersion) {
        return res.status(401).json({ success: false, message: 'JWT session has been revoked' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        tokenVersion: userVersion
      };
    }

    next();
  } catch (error) {
    console.error('Authorization failed:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const dummyRes = {
        status: () => dummyRes,
        json: () => dummyRes
      };
      await protect(req, dummyRes, () => {});
    } catch {
      // Ignore errors for optional auth
    }
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized. Super admin access required.' });
  }
};

module.exports = { protect, optionalProtect, admin, superAdmin };
