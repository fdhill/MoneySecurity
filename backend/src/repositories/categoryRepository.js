const pool = require('../config/db');
const Category = require('../models/Category');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM categories');
  return rows.map((row) => new Category(row));
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [
    id,
  ]);
  return rows[0] ? new Category(rows[0]) : null;
}

async function findByUserId(user_id) {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE user_id = $1',
    [user_id],
  );
  return rows.map((row) => new Category(row));
}

async function create({ user_id, name, type }) {
  const { rows } = await pool.query(
    'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *',
    [user_id, name, type],
  );
  return new Category(rows[0]);
}

async function update(id, { name }) {
  const { rows } = await pool.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
    [name, id],
  );
  return rows[0] ? new Category(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM categories WHERE id = $1',
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
