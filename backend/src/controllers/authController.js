const authService = require('../services/authService');
const userService = require('../services/userService');
const telegramService = require('../services/telegramService');
const { ok } = require('../utils/response');
const { httpError } = require('../utils/helpers');

async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(req.body);
    ok(res, { token, user }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.sub);
    ok(res, user.toJSON(), 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateProfile(req.user, req.body);
    ok(res, user.toJSON(), 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { old_password, new_password } = req.body;
    await userService.changePassword(req.user.sub, old_password, new_password);
    ok(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

async function telegramLinkToken(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.sub);
    if (!user.phone_number) {
      throw httpError('phone number required for telegram bot', 400);
    }
    const result = await telegramService.generateLinkToken(req.user.sub);
    ok(res, result, 'Telegram link token generated');
  } catch (err) {
    next(err);
  }
}

async function telegramStatus(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.sub);
    if (!user.phone_number) {
      throw httpError('phone number required for telegram bot', 400);
    }
    const status = await telegramService.getStatus(req.user.sub);
    ok(res, status, 'Telegram link status retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  me,
  updateProfile,
  changePassword,
  telegramLinkToken,
  telegramStatus,
};
