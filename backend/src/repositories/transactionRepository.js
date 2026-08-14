const pool = require('../config/db');
const Transaction = require('../models/Transaction');

const FROM_CLAUSE = `
  FROM transactions t
  JOIN wallets w ON t.wallet_id = w.id
  JOIN categories c ON t.category_id = c.id
`;

const SELECT_WITH_NAMES = `
  SELECT t.*, w.name AS wallet_name, c.name AS category_name
  ${FROM_CLAUSE}
`;

const SELECT_PAGED = `
  SELECT t.*, w.name AS wallet_name, c.name AS category_name, COUNT(*) OVER() AS total
  ${FROM_CLAUSE}
`;

async function findPage({ base, params, page, limit }) {
  const offset = (page - 1) * limit;
  params.push(limit, offset);
  const sql = `${base} ORDER BY t.transaction_date DESC, t.id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await pool.query(sql, params);
  let total = rows.length ? Number(rows[0].total) : 0;
  if (!rows.length) {
    const countSql = `SELECT COUNT(*) AS total ${FROM_CLAUSE}${base.replace(SELECT_PAGED, '')}`;
    const { rows: countRows } = await pool.query(countSql, params.slice(0, -2));
    total = Number(countRows[0].total);
  }
  return { rows: rows.map((row) => new Transaction(row)), total };
}

function withFilters(baseQuery, params, { start_date, end_date, category_id, wallet_id, type, q } = {}) {
  if (start_date && end_date) {
    params.push(start_date, end_date);
    baseQuery += ` AND t.transaction_date BETWEEN $${params.length - 1} AND $${params.length}`;
  } else if (start_date) {
    params.push(start_date);
    baseQuery += ` AND t.transaction_date >= $${params.length}`;
  } else if (end_date) {
    params.push(end_date);
    baseQuery += ` AND t.transaction_date <= $${params.length}`;
  }
  if (category_id) {
    params.push(category_id);
    baseQuery += ` AND t.category_id = $${params.length}`;
  }
  if (wallet_id) {
    params.push(wallet_id);
    baseQuery += ` AND t.wallet_id = $${params.length}`;
  }
  if (type) {
    params.push(type);
    baseQuery += ` AND t.type = $${params.length}`;
  }
  if (q) {
    params.push(`%${q}%`);
    baseQuery += ` AND t.description ILIKE $${params.length}`;
  }
  return baseQuery;
}

async function findAll(filters = {}) {
  const { page = 1, limit = 20 } = filters;
  const params = [];
  const base = withFilters(`${SELECT_PAGED} WHERE 1=1`, params, filters);
  return findPage({ base, params, page, limit });
}

async function findById(id) {
  const { rows } = await pool.query(`${SELECT_WITH_NAMES} WHERE t.id = $1`, [
    id,
  ]);
  return rows[0] ? new Transaction(rows[0]) : null;
}

async function findByUserId(user_id, filters = {}) {
  const { page = 1, limit = 20 } = filters;
  const params = [user_id];
  const base = withFilters(`${SELECT_PAGED} WHERE t.user_id = $1`, params, filters);
  return findPage({ base, params, page, limit });
}

async function create({
  user_id,
  wallet_id,
  category_id,
  amount,
  type,
  description,
  transaction_date,
}) {
  const { rows } = await pool.query(
    'INSERT INTO transactions (user_id, wallet_id, category_id, amount, type, description, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [
      user_id,
      wallet_id,
      category_id,
      amount,
      type,
      description,
      transaction_date,
    ],
  );
  return new Transaction(rows[0]);
}

async function update(
  id,
  { wallet_id, category_id, amount, type, description, transaction_date },
) {
  const { rows } = await pool.query(
    'UPDATE transactions SET wallet_id = $1, category_id = $2, amount = $3, type = $4, description = $5, transaction_date = $6 WHERE id = $7 RETURNING *',
    [wallet_id, category_id, amount, type, description, transaction_date, id],
  );
  return rows[0] ? new Transaction(rows[0]) : null;
}

async function sumExpenseByCategoryAndPeriod(category_id, start, end) {
  const { rows } = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE category_id = $1 AND type = 'expense' AND transaction_date BETWEEN $2 AND $3",
    [category_id, start, end],
  );
  return Number(rows[0].total);
}

async function remove(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM transactions WHERE id = $1',
    [id],
  );
  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findByUserId,
  create,
  update,
  sumExpenseByCategoryAndPeriod,
  remove,
};
