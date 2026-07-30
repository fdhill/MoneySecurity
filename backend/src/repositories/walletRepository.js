const pool = require('../config/db');
const Wallet = require('../models/Wallet');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM wallets');
  return rows.map((row) => new Wallet(row));
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM wallets WHERE id = $1', [
    id,
  ]);
  return rows[0] ? new Wallet(rows[0]) : null;
}

async function findByUserId(user_id) {
  const { rows } = await pool.query(
    'SELECT * FROM wallets WHERE user_id = $1',
    [user_id],
  );
  return rows.map((row) => new Wallet(row));
}

async function create({ user_id, name, balance }) {
  const { rows } = await pool.query(
    'INSERT INTO wallets (user_id, name, balance) VALUES ($1, $2, $3) RETURNING *',
    [user_id, name, balance],
  );
  return new Wallet(rows[0]);
}

async function update(id, { name, balance }) {
  const { rows } = await pool.query(
    'UPDATE wallets SET name = $1, balance = $2 WHERE id = $3 RETURNING *',
    [name, balance, id],
  );
  return rows[0] ? new Wallet(rows[0]) : null;
}

async function deductBalance(id, amount) {
  const { rows } = await pool.query(
    `UPDATE wallets 
     SET balance = balance - $1 
     WHERE id = $2 AND balance >= $1 
     RETURNING *`,
    [amount, id]
  );
  
  return rows[0] ? new Wallet(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM wallets WHERE id = $1', [
    id,
  ]);
  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findByUserId,
  create,
  update,
  deductBalance,
  remove,
};
