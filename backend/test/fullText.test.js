const assert = require('assert');
const { parseFullText } = require('../src/bots/telegramFlow');

const cases = [
  {
    name: 'minimal expense',
    input: 'pengeluaran_makan_cash_50000',
    want: { type: 'expense', categoryName: 'makan', walletName: 'cash', amount: 50000, description: null },
  },
  {
    name: 'income with description',
    input: 'pemasukan_gaji_bank_1500000_bonus akhir tahun',
    want: { type: 'income', categoryName: 'gaji', walletName: 'bank', amount: 1500000, description: 'bonus akhir tahun' },
  },
  {
    name: 'description with underscores and capital type',
    input: 'Pengeluaran_Makan_Cash_20000_makan_siang',
    want: { type: 'expense', categoryName: 'Makan', walletName: 'Cash', amount: 20000, description: 'makan_siang' },
  },
  {
    name: 'missing fields',
    input: 'pengeluaran_makan',
    want: { error: 'format' },
  },
  {
    name: 'invalid amount',
    input: 'pengeluaran_makan_cash_abc',
    want: { error: 'amount' },
  },
  {
    name: 'zero amount',
    input: 'pengeluaran_makan_cash_0',
    want: { error: 'amount' },
  },
  {
    name: 'not a transaction',
    input: 'halo apa kabar',
    want: { error: 'not-a-transaction' },
  },
];

for (const { name, input, want } of cases) {
  const got = parseFullText(input);
  if (want.error) {
    assert.strictEqual(got.error, want.error, name);
  } else {
    assert.deepStrictEqual(got.value, want, name);
  }
  console.log(`ok - ${name}`);
}

console.log('all full-text parse checks passed');
