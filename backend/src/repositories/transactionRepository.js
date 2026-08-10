const pool = require('../config/db');
const Transaction = require('../models/Transaction');

const SELECT_WITH_NAMES = `
  SELECT t.*, w.name AS wallet_name, c.name AS category_name
  FROM transactions t
  JOIN wallets w ON t.wallet_id = w.id
  JOIN categories c ON t.category_id = c.id
`;

function withPeriodFilter(baseQuery, params, { start_date, end_date } = {}) {
  if (start_date && end_date) {
    params.push(start_date, end_date);
    return `${baseQuery} AND t.transaction_date BETWEEN $${params.length - 1} AND $${params.length}`;
  }
  if (start_date) {
    params.push(start_date);
    return `${baseQuery} AND t.transaction_date >= $${params.length}`;
  }
  if (end_date) {
    params.push(end_date);
    return `${baseQuery} AND t.transaction_date <= $${params.length}`;
  }
  return baseQuery;
}

async function findAll(filters = {}) {
  const params = [];
  const { rows } = await pool.query(withPeriodFilter(SELECT_WITH_NAMES, params, filters), params);
  return rows.map((row) => new Transaction(row));
}

async function findById(id) {
  const { rows } = await pool.query(`${SELECT_WITH_NAMES} WHERE t.id = $1`, [
    id,
  ]);
  return rows[0] ? new Transaction(rows[0]) : null;
}

async function findByUserId(user_id, filters = {}) {
  const params = [user_id];
  const { rows } = await pool.query(
    withPeriodFilter(`${SELECT_WITH_NAMES} WHERE t.user_id = $1`, params, filters),
    params,
  );
  return rows.map((row) => new Transaction(row));
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

async function update(id, { wallet_id, category_id, amount, type, description, transaction_date }) {
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
