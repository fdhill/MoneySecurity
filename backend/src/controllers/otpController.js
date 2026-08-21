const otpService = require('../services/otpService');
const userService = require('../services/userService');
const authService = require('../services/authService');
const { ok } = require('../utils/response');

async function requestOtp(req, res, next) {
  try {
    const { email } = req.body;
    const result = await otpService.requestOtp(email, 'register');
    ok(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, code, name, password, phone_number } = req.body;

    await otpService.verifyOtp(email, code, 'register');

    const user = await userService.createUser(
      { email, name, password, phone_number },
      null,
    );

    const { token } = await authService.login({ email, password });

    ok(res, { token, user: user.toJSON() }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { requestOtp, verifyOtp };
