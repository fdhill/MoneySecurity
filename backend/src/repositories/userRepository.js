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

async function findByWhatsappNumber(whatsappNumber) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE whatsapp_number = $1',
    [whatsappNumber],
  );
  return rows[0] ? new User(rows[0]) : null;
}

async function create({ name, whatsapp_number, password, role }) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, whatsapp_number, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, whatsapp_number, password, role],
  );
  return new User(rows[0]);
}

async function update(id, { name, whatsapp_number }) {
  const { rows } = await pool.query(
    'UPDATE users SET name = $1, whatsapp_number = $2 WHERE id = $3 RETURNING *',
    [name, whatsapp_number, id],
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
  findByWhatsappNumber,
  create,
  update,
  remove,
  changePassword,
};
