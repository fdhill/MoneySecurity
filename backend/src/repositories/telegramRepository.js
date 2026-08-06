const pool = require('../config/db');
const Telegram = require('../models/Telegram');

async function findByUserId(user_id) {
  const { rows } = await pool.query(
    'SELECT * FROM telegrams WHERE user_id = $1',
    [user_id],
  );
  return rows[0] ? new Telegram(rows[0]) : null;
}

async function findByChatId(chat_id) {
  const { rows } = await pool.query(
    'SELECT * FROM telegrams WHERE chat_id = $1',
    [chat_id],
  );
  return rows[0] ? new Telegram(rows[0]) : null;
}

async function findByLinkToken(link_token) {
  const { rows } = await pool.query(
    'SELECT * FROM telegrams WHERE link_token = $1',
    [link_token],
  );
  return rows[0] ? new Telegram(rows[0]) : null;
}

async function saveLinkToken(user_id, link_token, link_token_expires_at) {
  const { rows } = await pool.query(
    `INSERT INTO telegrams (user_id, link_token, link_token_expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id)
     DO UPDATE SET link_token = $2, link_token_expires_at = $3
     RETURNING *`,
    [user_id, link_token, link_token_expires_at],
  );
  return new Telegram(rows[0]);
}

async function linkChat(user_id, chat_id) {
  const { rows } = await pool.query(
    `UPDATE telegrams
     SET chat_id = $2, link_token = NULL, link_token_expires_at = NULL
     WHERE user_id = $1
     RETURNING *`,
    [user_id, chat_id],
  );
  return rows[0] ? new Telegram(rows[0]) : null;
}

async function remove(user_id) {
  const { rowCount } = await pool.query(
    'DELETE FROM telegrams WHERE user_id = $1',
    [user_id],
  );
  return rowCount > 0;
}

module.exports = {
  findByUserId,
  findByChatId,
  findByLinkToken,
  saveLinkToken,
  linkChat,
  remove,
};
