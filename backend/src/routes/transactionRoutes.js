const { Router } = require('express');
const transactionController = require('../controllers/transactionController');
const { transactionCreate, transactionUpdate, transactionList } = require('../validation/transactionValidation');

const router = Router();

/**
 * @swagger
 * /transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Get all transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page (default 20)
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category
 *       - in: query
 *         name: wallet_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by wallet
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [expense, income]
 *         description: Filter by transaction type
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search in description (ILIKE)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter end date
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/', transactionList, transactionController.index);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', transactionController.show);

/**
 * @swagger
 * /transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wallet_id, category_id, amount, type]
 *             properties:
 *               wallet_id:
 *                 type: integer
 *                 example: 1
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 50000
 *               type:
 *                 type: string
 *                 enum: [expense, income]
 *                 example: expense
 *               description:
 *                 type: string
 *                 example: Lunch at warung
 *               transaction_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-07-28
 *                 description: 'Defaults to today if not provided'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', transactionCreate, transactionController.store);

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update transaction by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wallet_id:
 *                 type: integer
 *                 example: 1
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 60000
 *               type:
 *                 type: string
 *                 enum: [expense, income]
 *                 example: expense
 *               description:
 *                 type: string
 *                 example: Dinner at restaurant
 *               transaction_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-07-28
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.put('/:id', transactionUpdate, transactionController.update);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete transaction by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.delete('/:id', transactionController.destroy);

module.exports = router;
