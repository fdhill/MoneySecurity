const exportService = require('../services/exportService');

async function exportTransactions(req, res, next) {
  try {
    const workbook = await exportService.exportTransactions(req.user, req.query);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="transactions.xlsx"',
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { exportTransactions };
