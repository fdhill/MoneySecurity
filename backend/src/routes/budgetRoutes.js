const { Router } = require('express');
const budgetController = require('../controllers/budgetController');
const { budgetCreate, budgetUpdate } = require('../validation/budgetValidation');

const router = Router();

/**
 * @swagger
 * /budgets:
 *   get:
 *     tags: [Budgets]
 *     summary: Get all budget templates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/', budgetController.indexTemplates);

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     tags: [Budgets]
 *     summary: Get budget template by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget template ID
 *     responses:
 *       200:
 *         description: Budget template retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Budget template not found
 */
router.get('/:id', budgetController.showTemplate);

/**
 * @swagger
 * /budgets:
 *   post:
 *     tags: [Budgets]
 *     summary: Create a new budget template
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_id, amount, frequency]
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 1000000
 *               frequency:
 *                 type: string
 *                 enum: [monthly, weekly]
 *                 example: monthly
 *               is_recurring:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Budget template created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', budgetCreate, budgetController.storeTemplate);

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     tags: [Budgets]
 *     summary: Update budget template by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 2000000
 *               frequency:
 *                 type: string
 *                 enum: [monthly, weekly]
 *                 example: monthly
 *               is_recurring:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Budget template updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Budget template not found
 */
router.put('/:id', budgetUpdate, budgetController.updateTemplate);

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     tags: [Budgets]
 *     summary: Delete budget template by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget template ID
 *     responses:
 *       200:
 *         description: Budget template deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Budget template not found
 */
router.delete('/:id', budgetController.destroyTemplate);

/**
 * @swagger
 * /budgets/{id}/instance:
 *   get:
 *     tags: [Budgets]
 *     summary: Get active budget instance for a template
 *     description: Generates a new instance on-demand if none exists for the current period.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget template ID
 *     responses:
 *       200:
 *         description: Budget instance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Budget template not found
 */
router.get('/:id/instance', budgetController.activeInstance);

/**
 * @swagger
 * /budgets/instances/{id}/summary:
 *   get:
 *     tags: [Budgets]
 *     summary: Get budget instance spending summary
 *     description: Returns spent, remaining, days_left, and daily_estimate.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget instance ID
 *     responses:
 *       200:
 *         description: Budget summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Budget instance not found
 */
router.get('/instances/:id/summary', budgetController.instanceSummary);

module.exports = router;
