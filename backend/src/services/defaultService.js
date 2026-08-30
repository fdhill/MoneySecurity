const DEFAULT_WALLET = 'Cash';

const DEFAULT_CATEGORIES = [
  { name: 'Makan', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Belanja', type: 'expense' },
  { name: 'Tagihan', type: 'expense' },
  { name: 'Hiburan', type: 'expense' },
  { name: 'Gaji', type: 'income' },
  { name: 'Bonus', type: 'income' },
  { name: 'Lainnya', type: 'income' },
];

// ponytail: takes a transaction client, not pool — caller owns BEGIN/COMMIT/ROLLBACK
async function provisionDefaults(client, userId) {
  await client.query(
    'INSERT INTO wallets (user_id, name, balance) VALUES ($1, $2, 0)',
    [userId, DEFAULT_WALLET],
  );

  for (const cat of DEFAULT_CATEGORIES) {
    await client.query(
      'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3)',
      [userId, cat.name, cat.type],
    );
  }
}

module.exports = { provisionDefaults };
