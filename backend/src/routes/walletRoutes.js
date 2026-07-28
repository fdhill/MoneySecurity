const { Router } = require('express');
const walletController = require('../controllers/walletController');

const router = Router();

/**
 * @swagger
 * /wallets:
 *   get:
 *     tags: [Wallets]
 *     summary: Get all wallets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/', walletController.index);

/**
 * @swagger
 * /wallets/{id}:
 *   get:
 *     tags: [Wallets]
 *     summary: Get wallet by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
router.get('/:id', walletController.show);

/**
 * @swagger
 * /wallets:
 *   post:
 *     tags: [Wallets]
 *     summary: Create a new wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, balance]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cash
 *               balance:
 *                 type: number
 *                 example: 500000
 *     responses:
 *       201:
 *         description: Wallet created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', walletController.store);

/**
 * @swagger
 * /wallets/{id}:
 *   put:
 *     tags: [Wallets]
 *     summary: Update wallet by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Wallet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, balance]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cash Updated
 *               balance:
 *                 type: number
 *                 example: 600000
 *     responses:
 *       200:
 *         description: Wallet updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
router.put('/:id', walletController.update);

/**
 * @swagger
 * /wallets/{id}:
 *   delete:
 *     tags: [Wallets]
 *     summary: Delete wallet by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
router.delete('/:id', walletController.destroy);

module.exports = router;
