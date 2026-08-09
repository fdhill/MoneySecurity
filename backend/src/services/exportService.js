const ExcelJS = require('exceljs');
const transactionRepository = require('../repositories/transactionRepository');

const COLUMNS = [
  { header: 'No', key: 'no', width: 6 },
  { header: 'Tanggal', key: 'transaction_date', width: 14 },
  { header: 'Tipe', key: 'type', width: 10 },
  { header: 'Kategori', key: 'category_name', width: 20 },
  { header: 'Dompet', key: 'wallet_name', width: 20 },
  { header: 'Deskripsi', key: 'description', width: 30 },
  { header: 'Jumlah', key: 'amount', width: 16 },
];

async function exportTransactions(user, filters = {}) {
  let transactions;
  if (user.role == 1) {
    transactions = await transactionRepository.findAll(filters);
  } else {
    transactions = await transactionRepository.findByUserId(user.sub, filters);
  }

  transactions.sort((a, b) => (a.transaction_date < b.transaction_date ? -1 : 1));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MoneySecurity';
  const sheet = workbook.addWorksheet('Transaksi');
  sheet.columns = COLUMNS;
  sheet.getRow(1).font = { bold: true };

  transactions.forEach((t, i) => {
    sheet.addRow({
      no: i + 1,
      transaction_date: t.transaction_date,
      type: t.type,
      category_name: t.category_name,
      wallet_name: t.wallet_name,
      description: t.description,
      amount: t.amount,
    });
  });

  return workbook;
}

module.exports = { exportTransactions };
