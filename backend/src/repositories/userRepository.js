const pool = require('../config/db');
const User = require('../models/User');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows.map((row) => new User(row));
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ? new User(rows[0]) : null;
}

async function findByPhoneNumber(phoneNumber) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE phone_number = $1',
    [phoneNumber],
  );
  return rows[0] ? new User(rows[0]) : null;
}

async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );
  return rows[0] ? new User(rows[0]) : null;
}

// ponytail: optional client for transaction support
async function create({ name, email, phone_number, password, role }, client) {
  const q = client || pool;
  const { rows } = await q.query(
    'INSERT INTO users (name, email, phone_number, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, email, phone_number, password, role],
  );
  return new User(rows[0]);
}

async function update(id, { name, phone_number }) {
  const { rows } = await pool.query(
    'UPDATE users SET name = $1, phone_number = $2 WHERE id = $3 RETURNING *',
    [name, phone_number || null, id],
  );
  return rows[0] ? new User(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [
    id,
  ]);
  return rowCount > 0;
}

async function changePassword(id, password) {
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [
    password,
    id,
  ]);
  return 'Your password has been successfully changed';
}

module.exports = {
  findAll,
  findById,
  findByPhoneNumber,
  findByEmail,
  create,
  update,
  remove,
  changePassword,
};
