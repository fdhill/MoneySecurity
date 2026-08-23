const pool = require('../config/db');

async function insert({ user_id, description }) {
  const { rows } = await pool.query(
    'INSERT INTO activity_logs (user_id, description) VALUES ($1, $2) RETURNING id, description, read_at, created_at',
    [user_id, description],
  );
  return rows[0];
}

async function findUnreadByUserId(user_id, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT id, description, created_at, COUNT(*) OVER() AS total
     FROM activity_logs
     WHERE user_id = $1 AND read_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [user_id, limit, offset],
  );

  let total = rows.length ? Number(rows[0].total) : 0;
  if (!rows.length) {
    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*) AS total FROM activity_logs WHERE user_id = $1 AND read_at IS NULL',
      [user_id],
    );
    total = Number(countRows[0].total);
  }

  return { rows, total };
}

async function countUnreadByUserId(user_id) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM activity_logs WHERE user_id = $1 AND read_at IS NULL',
    [user_id],
  );
  return Number(rows[0].count);
}

async function markReadById(id, user_id) {
  const { rows } = await pool.query(
    'UPDATE activity_logs SET read_at = now() WHERE id = $1 AND user_id = $2 AND read_at IS NULL RETURNING id',
    [id, user_id],
  );
  return rows[0] || null;
}

async function markAllReadByUserId(user_id) {
  const { rowCount } = await pool.query(
    'UPDATE activity_logs SET read_at = now() WHERE user_id = $1 AND read_at IS NULL',
    [user_id],
  );
  return rowCount;
}

module.exports = {
  insert,
  findUnreadByUserId,
  countUnreadByUserId,
  markReadById,
  markAllReadByUserId,
};
