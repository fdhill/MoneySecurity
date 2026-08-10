const { Router } = require('express');
const exportController = require('../controllers/exportController');
const {
  exportTransactions,
} = require('../validation/exportValidation');

const router = Router();

/**
 * @swagger
 * /export:
 *   get:
 *     tags: [Export]
 *     summary: Export transactions as an Excel (.xlsx) file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-07-01
 *         description: Include only transactions on or after this date
 *       - in: query
 *         name: end_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-07-31
 *         description: Include only transactions on or before this date
 *     responses:
 *       200:
 *         description: Excel file downloaded
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', exportTransactions, exportController.exportTransactions);

module.exports = router;
