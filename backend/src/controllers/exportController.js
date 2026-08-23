const exportService = require('../services/exportService');
const activityService = require('../services/activityService');

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

    activityService.log(req.user.sub, 'Export transaksi ke Excel');
  } catch (err) {
    next(err);
  }
}

module.exports = { exportTransactions };
