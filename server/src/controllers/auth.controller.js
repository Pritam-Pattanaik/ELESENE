const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
require('../config/env')

const JWT_SECRET = process.env.JWT_SECRET || 'elesene_dev_secret';

const generateToken = (id, role, tokenVersion = 0) => {
  return jwt.sign({ id, role, tokenVersion, token_version: tokenVersion }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, full_name, phone, password, firebase_uid } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate email verification token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');

    const user = await User.create({
      email,
      full_name,
      phone,
      firebase_uid,
      password_hash,
      role: 'customer',
      is_verified: false,
      verification_token: verificationTokenHash,
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      tokenVersion: 0
    });

    if (user) {
      // Trigger async verification email
      sendVerificationEmail(user.email, rawVerificationToken).catch(err => console.error('Verification email send error:', err));

      const version = user.tokenVersion !== undefined ? user.tokenVersion : 0;
      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_verified: user.is_verified
        },
        token: generateToken(user.id, user.role, version),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ success: false, message: 'Please use your original sign-in method' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const version = user.tokenVersion !== undefined ? user.tokenVersion : (user.token_version || 0);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified
      },
      token: generateToken(user.id, user.role, version),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin login with admin_id + password (email is never exposed to the client)
// @route   POST /api/auth/admin-login
//
// Admin IDs are opaque short strings defined in server env vars.
// The server resolves them to emails internally — the client never sees or sends an email.
//
// Env vars expected (set in server/.env):
//   ADMIN_ID          — ID for the standard admin  (default: "ELESENE-ADMIN")
//   ADMIN_EMAIL       — email that maps to ADMIN_ID
//   SUPERADMIN_ID     — ID for the super-admin      (default: "ELESENE-SUPERADMIN")
//   SUPERADMIN_EMAIL  — email that maps to SUPERADMIN_ID (falls back to ADMIN_EMAIL)
const adminLogin = async (req, res) => {
  try {
    const { admin_id, password } = req.body;

    if (!admin_id || !password) {
      return res.status(400).json({ success: false, message: 'Admin ID and password are required' });
    }

    // ── Build the ID → email lookup map from env ──────────────────────────────
    const idMap = {
      [process.env.ADMIN_ID      || 'ELESENE-ADMIN']:      process.env.ADMIN_EMAIL,
      [process.env.SUPERADMIN_ID || 'ELESENE-SUPERADMIN']: process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL,
    };

    const resolvedEmail = idMap[admin_id.trim()];

    // Use a generic error so IDs are not enumerable
    const GENERIC_ERR = 'Invalid admin ID or password';

    if (!resolvedEmail) {
      return res.status(401).json({ success: false, message: GENERIC_ERR });
    }

    const user = await User.findOne({ where: { email: resolvedEmail } });

    if (!user) {
      return res.status(401).json({ success: false, message: GENERIC_ERR });
    }

    // Enforce admin / superadmin role
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ success: false, message: 'Password not set for this account' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: GENERIC_ERR });
    }

    const version = user.tokenVersion !== undefined ? user.tokenVersion : (user.token_version || 0);

    res.json({
      success: true,
      user: {
        id:        user.id,
        full_name: user.full_name,
        role:      user.role,
        // email intentionally omitted from response — not needed by the admin UI
      },
      token: generateToken(user.id, user.role, version),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expires', 'verification_token', 'verification_token_expires'] }
    });

    if (user) {
      res.json({
        success: true,
        user,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user & increment tokenVersion to revoke active JWTs
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.tokenVersion = (user.tokenVersion !== undefined ? user.tokenVersion : (user.token_version || 0)) + 1;
    await user.save();

    res.json({ success: true, message: 'Logged out successfully. All active sessions revoked.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user password & revoke existing tokens
// @route   POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user || !user.password_hash) {
      return res.status(400).json({ success: false, message: 'Invalid user or sign-in method' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    user.tokenVersion = (user.tokenVersion !== undefined ? user.tokenVersion : (user.token_version || 0)) + 1;
    await user.save();

    const newToken = generateToken(user.id, user.role, user.tokenVersion);
    res.json({
      success: true,
      message: 'Password changed successfully',
      token: newToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initiate password reset (forgot password)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });

    // For security, do not disclose if email exists
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with that email, a password reset link has been sent.' 
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.reset_password_token = tokenHash;
    user.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
    await user.save();

    await sendPasswordResetEmail(user.email, rawToken);

    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, new_password } = req.body;
    const passwordToSet = newPassword || new_password;

    if (!token || !passwordToSet) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (passwordToSet.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        reset_password_token: tokenHash,
        reset_password_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(passwordToSet, salt);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    user.tokenVersion = (user.tokenVersion !== undefined ? user.tokenVersion : (user.token_version || 0)) + 1; // Revoke old tokens

    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/send-verification-email
const sendVerificationEmailHandler = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.verification_token = tokenHash;
    user.verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, rawToken);

    res.json({ success: true, message: 'Verification email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email with token
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        verification_token: tokenHash,
        verification_token_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.is_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  sendVerificationEmailHandler,
  verifyEmail
};
