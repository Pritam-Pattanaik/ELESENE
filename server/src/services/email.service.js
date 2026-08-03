/**
 * Transactional Email Service (Mock / Extensible for Nodemailer/SendGrid)
 */

const sendVerificationEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  console.log('====================================================');
  console.log(`[EMAIL SERVICE] Sending Email Verification to: ${email}`);
  console.log(`[EMAIL SERVICE] Verification URL: ${verifyUrl}`);
  console.log('====================================================');

  return true;
};

const sendPasswordResetEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  console.log('====================================================');
  console.log(`[EMAIL SERVICE] Sending Password Reset to: ${email}`);
  console.log(`[EMAIL SERVICE] Reset URL: ${resetUrl}`);
  console.log('====================================================');

  return true;
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
