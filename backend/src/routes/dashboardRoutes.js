const { Router } = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard summary (wallets, categories, totals, cashflow, category expense, recent transactions, budgets)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/', dashboardController.index);

module.exports = router;
