const dashboardService = require('../services/dashboardService');
const { ok } = require('../utils/response');

async function index(req, res) {
  const data = await dashboardService.getDashboard(req.user);
  ok(res, data, 'Dashboard berhasil dimuat');
}

module.exports = { index };
