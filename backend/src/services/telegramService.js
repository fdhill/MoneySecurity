const crypto = require('crypto');
const telegramRepository = require('../repositories/telegramRepository');
const userRepository = require('../repositories/userRepository');
const walletRepository = require('../repositories/walletRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { httpError } = require('../utils/helpers');

const TOKEN_TTL_MS = 10 * 60 * 1000;

async function generateLinkToken(user_id) {
  const token = crypto.randomBytes(6).toString('hex').toUpperCase();
  const link_token_expires_at = new Date(Date.now() + TOKEN_TTL_MS);
  await telegramRepository.saveLinkToken(user_id, token, link_token_expires_at);
  return { token, expires_at: link_token_expires_at };
}

async function linkByToken(token, chat_id) {
  const record = await telegramRepository.findByLinkToken(token);
  if (!record) {
    throw httpError('Link token is invalid', 400);
  }
  if (record.isLinked()) {
    throw httpError('This account is already linked to a Telegram chat', 400);
  }
  if (
    !record.link_token_expires_at ||
    new Date(record.link_token_expires_at) < new Date()
  ) {
    throw httpError('Link token has expired', 400);
  }
  await telegramRepository.linkChat(record.user_id, chat_id);
  return record.user_id;
}

async function unlink(user_id) {
  await telegramRepository.remove(user_id);
}

async function getStatus(user_id) {
  const record = await telegramRepository.findByUserId(user_id);
  return {
    linked: !!record && record.isLinked(),
    chat_id: record && record.isLinked() ? String(record.chat_id) : null,
  };
}

async function getUserByChatId(chat_id) {
  const record = await telegramRepository.findByChatId(String(chat_id));
  if (!record) return null;
  return userRepository.findById(record.user_id);
}

async function getWallets(user_id) {
  return walletRepository.findByUserId(user_id);
}

async function getCategories(user_id, type) {
  const categories = await categoryRepository.findByUserId(user_id);
  return categories.filter((category) => category.type === type);
}

module.exports = {
  generateLinkToken,
  linkByToken,
  unlink,
  getStatus,
  getUserByChatId,
  getWallets,
  getCategories,
};
