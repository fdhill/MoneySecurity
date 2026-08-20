const otpRepository = require('../repositories/otpRepository');
const userRepository = require('../repositories/userRepository');
const nodemailer = require('nodemailer');
const { httpError } = require('../utils/helpers');

const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 3;
const OTP_RATE_LIMIT_MINUTES = 1;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function requestOtp(email, purpose = 'register') {
  if (purpose === 'register') {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw httpError('email already used', 409);
    }
  }

  const now = new Date();
  const since = new Date(now - OTP_RATE_LIMIT_MINUTES * 60 * 1000);

  const recent = await otpRepository.findRecentByEmail(email, purpose, since);
  if (recent.length > 0) {
    throw httpError('Too many OTP requests', 429);
  }

  const code = generateCode();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const existingOtp = await otpRepository.findLatestUnused(email, purpose);
  if (existingOtp) {
    await otpRepository.updateOtp(existingOtp.id, { code, expires_at: expiresAt });
  } else {
    await otpRepository.create({ email, code, purpose, expires_at: expiresAt });
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'MoneySecurity — Kode Verifikasi',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:20px">
        <h2 style="margin:0 0 8px">Kode Verifikasi Anda</h2>
        <p style="margin:0 0 16px;color:#555">Gunakan kode berikut untuk menyelesaikan registrasi:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:16px;background:#f4f4f5;border-radius:8px">${code}</div>
        <p style="margin:16px 0 0;color:#999;font-size:13px">Kode ini kadaluarsa dalam ${OTP_EXPIRY_MINUTES} menit. Jika Anda tidak meminta kode ini, abaikan email ini.</p>
      </div>
    `,
  });

  return { message: 'OTP sent to email' };
}

async function verifyOtp(email, code, purpose = 'register') {
  const otp = await otpRepository.findLatestUnused(email, purpose);
  if (!otp) throw httpError('OTP invalid', 400);

  if (new Date() > new Date(otp.expires_at)) {
    throw httpError('OTP expired', 400);
  }

  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await otpRepository.markUsed(otp.id);
    throw httpError('Too many OTP attempts', 400);
  }

  if (otp.code !== code) {
    await otpRepository.incrementAttempts(otp.id);
    throw httpError('OTP invalid', 400);
  }

  await otpRepository.markUsed(otp.id);

  return true;
}

module.exports = { requestOtp, verifyOtp };
