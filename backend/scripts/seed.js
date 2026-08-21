require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'moneysecurity',
});

const PHONE_NUMBER = '081100000001';
const EMAIL = 'perftest@moneysecurity.test';
const PASSWORD = 'perftest123';
const NAME = 'Perf Tester';
const TRANSACTION_COUNT = 10000;

const WALLETS = ['Cash', 'Bank BCA', 'E-Wallet'];
const EXPENSE_CATEGORIES = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan'];
const INCOME_CATEGORIES = ['Gaji', 'Bonus', 'Lainnya'];
const DESCRIPTIONS = [
  'Kebutuhan sehari-hari',
  'Makan siang di warteg',
  'Bensin motor',
  'Belanja bulanan',
  'Bayar listrik',
  'Nonton bioskop',
  'Transfer dari rekening lain',
  'Top up e-wallet',
  'Kopi di kafe',
  'Belanja online',
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

async function main() {
  const client = await pool.connect();
  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await client.query(
      `INSERT INTO users (name, phone_number, email, password, role)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), 0)
       ON CONFLICT (email) DO UPDATE SET role = 0`,
      [NAME, PHONE_NUMBER, EMAIL, PASSWORD],
    );
    const { rows: [user] } = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [EMAIL],
    );

    await client.query('DELETE FROM transactions WHERE user_id = $1', [user.id]);
    await client.query('DELETE FROM budget_templates WHERE user_id = $1', [user.id]);
    await client.query('DELETE FROM wallets WHERE user_id = $1', [user.id]);
    await client.query('DELETE FROM categories WHERE user_id = $1', [user.id]);

    const walletIds = {};
    for (const name of WALLETS) {
      const { rows: [w] } = await client.query(
        'INSERT INTO wallets (user_id, name, balance) VALUES ($1, $2, $3) RETURNING id',
        [user.id, name, 10000000],
      );
      walletIds[name] = w.id;
    }

    const catIds = { expense: [], income: [] };
    for (const name of EXPENSE_CATEGORIES) {
      const { rows: [c] } = await client.query(
        'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING id',
        [user.id, name, 'expense'],
      );
      catIds.expense.push(c.id);
    }
    for (const name of INCOME_CATEGORIES) {
      const { rows: [c] } = await client.query(
        'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING id',
        [user.id, name, 'income'],
      );
      catIds.income.push(c.id);
    }

    const walletList = Object.values(walletIds);
    const BATCH = 1000;
    for (let offset = 0; offset < TRANSACTION_COUNT; offset += BATCH) {
      const values = [];
      for (let i = 0; i < BATCH && offset + i < TRANSACTION_COUNT; i++) {
        const isExpense = Math.random() < 0.8;
        const catIdsForType = isExpense ? catIds.expense : catIds.income;
        values.push([
          user.id,
          pick(walletList),
          pick(catIdsForType),
          rand(5000, 500000),
          isExpense ? 'expense' : 'income',
          pick(DESCRIPTIONS),
          daysAgo(rand(0, 365)),
        ]);
      }
      const placeholders = values
        .map(
          (_, i) =>
            `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`,
        )
        .join(', ');
      await client.query(
        `INSERT INTO transactions (user_id, wallet_id, category_id, amount, type, description, transaction_date)
         VALUES ${placeholders}`,
        values.flat(),
      );
    }

    const { rows: [count] } = await client.query(
      'SELECT COUNT(*)::int AS n FROM transactions WHERE user_id = $1',
      [user.id],
    );

    console.log('=== SEED SELESAI ===');
    console.log(`User    : ${NAME} (${EMAIL}) / password: ${PASSWORD}`);
    console.log(`Wallets : ${WALLETS.join(', ')}`);
    console.log(`Category: ${EXPENSE_CATEGORIES.join(', ')} (expense), ${INCOME_CATEGORIES.join(', ')} (income)`);
    console.log(`Transaksi: ${count.n}`);
    console.log(`Wallet ID untuk POST transaksi: ${JSON.stringify(walletIds)}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
