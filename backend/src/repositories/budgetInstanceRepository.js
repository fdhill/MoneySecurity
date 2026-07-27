const pool = require('../config/db');
const BudgetInstance = require('../models/BudgetInstance');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM budget_instances');
  return rows.map((row) => new BudgetInstance(row));
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM budget_instances WHERE id = $1',
    [id],
  );
  return rows[0] ? new BudgetInstance(rows[0]) : null;
}

async function findByTemplateId(template_id) {
  const { rows } = await pool.query(
    'SELECT * FROM budget_instances WHERE template_id = $1',
    [template_id],
  );
  return rows.map((row) => new BudgetInstance(row));
}

async function findActiveByTemplateId(template_id, date) {
  const { rows } = await pool.query(
    'SELECT * FROM budget_instances WHERE template_id = $1 AND period_start <= $2 AND period_end >= $2',
    [template_id, date],
  );
  return rows[0] ? new BudgetInstance(rows[0]) : null;
}

async function create({ template_id, period_start, period_end }) {
  const { rows } = await pool.query(
    'INSERT INTO budget_instances (template_id, period_start, period_end) VALUES ($1, $2, $3) RETURNING *',
    [template_id, period_start, period_end],
  );
  return new BudgetInstance(rows[0]);
}

async function updateSpent(id, spent) {
  const { rows } = await pool.query(
    'UPDATE budget_instances SET spent = $1 WHERE id = $2 RETURNING *',
    [spent, id],
  );
  return rows[0] ? new BudgetInstance(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM budget_instances WHERE id = $1',
    [id],
  );
  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findActiveByTemplateId,
  findByTemplateId,
  create,
  updateSpent,
  remove,
};
