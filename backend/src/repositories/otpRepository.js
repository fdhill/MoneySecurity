const pool = require('../config/db');

async function findRecentByEmail(email, purpose, since) {
  const { rows } = await pool.query(
    `SELECT created_at FROM otps
     WHERE email = $1 AND purpose = $2 AND created_at > $3
     ORDER BY created_at DESC LIMIT 1`,
    [email, purpose, since],
  );
  return rows;
}

async function create({ email, code, purpose, expires_at }) {
  await pool.query(
    `INSERT INTO otps (email, code, purpose, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [email, code, purpose, expires_at],
  );
}

async function findLatestUnused(email, purpose) {
  const { rows } = await pool.query(
    `SELECT * FROM otps
     WHERE email = $1 AND purpose = $2 AND used = false
     ORDER BY created_at DESC LIMIT 1`,
    [email, purpose],
  );
  return rows[0] || null;
}

async function markUsed(id) {
  await pool.query('UPDATE otps SET used = true WHERE id = $1', [id]);
}

async function incrementAttempts(id) {
  await pool.query(
    'UPDATE otps SET attempts = attempts + 1 WHERE id = $1',
    [id],
  );
}

module.exports = {
  findRecentByEmail,
  create,
  findLatestUnused,
  markUsed,
  incrementAttempts,
};
