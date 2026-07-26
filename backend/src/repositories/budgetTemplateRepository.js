const pool = require('../config/db');
const BudgetTemplate = require('../models/BudgetTemplate');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM budget_templates');
  return rows.map((row) => new BudgetTemplate(row));
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM budget_templates WHERE id = $1',
    [id],
  );
  return rows[0] ? new BudgetTemplate(rows[0]) : null;
}

async function findByUserId(user_id) {
  const { rows } = await pool.query(
    'SELECT * FROM budget_templates WHERE user_id = $1',
    [user_id],
  );
  return rows.map((row) => new BudgetTemplate(row));
}

async function create({
  user_id,
  category_id,
  amount,
  frequency,
  is_recurring,
}) {
  const { rows } = await pool.query(
    'INSERT INTO budget_templates (user_id, category_id, amount, frequency, is_recurring) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [user_id, category_id, amount, frequency, is_recurring],
  );
  return new BudgetTemplate(rows[0]);
}

async function update(id, { amount, frequency, is_recurring }) {
  const { rows } = await pool.query(
    'UPDATE budget_templates SET amount = $1, frequency = $2, is_recurring = $3 WHERE id = $4 RETURNING *',
    [amount, frequency, is_recurring, id],
  );
  return rows[0] ? new BudgetTemplate(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM budget_templates WHERE id = $1',
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
  remove,
};
