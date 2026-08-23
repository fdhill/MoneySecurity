const { Router } = require('express');
const activityController = require('../controllers/activityController');
const {
  activityList,
  activityMarkRead,
} = require('../validation/activityValidation');

const router = Router();

/**
 * @swagger
 * /activities:
 *   get:
 *     tags: [Activities]
 *     summary: Get unread activities of the current user
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
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/', activityList, activityController.index);

/**
 * @swagger
 * /activities/unread-count:
 *   get:
 *     tags: [Activities]
 *     summary: Count unread activities of the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', activityController.unreadCount);

/**
 * @swagger
 * /activities/read-all:
 *   patch:
 *     tags: [Activities]
 *     summary: Mark all activities of the current user as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All activities marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.patch('/read-all', activityController.markAllRead);

/**
 * @swagger
 * /activities/{id}/read:
 *   patch:
 *     tags: [Activities]
 *     summary: Mark a single activity as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: Activity marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Activity not found
 */
router.patch('/:id/read', activityMarkRead, activityController.markRead);

module.exports = router;
