const { Router } = require('express');
const authController = require('../controllers/authController');
const otpController = require('../controllers/otpController');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authenticate');
const {
  authLogin,
  authRegister,
  authUpdateProfile,
  authChangePassword,
  authRequestOtp,
  authVerifyOtp,
} = require('../validation/authValidation');

const router = Router();

/**
 * @swagger
 * /auth/request-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Request OTP code for registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many OTP requests
 */
router.post('/request-otp', authRequestOtp, otpController.requestOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and complete registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, name, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               code:
 *                 type: string
 *                 example: 123456
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: secret123
 *               whatsapp_number:
 *                 type: string
 *                 example: 6281234567890
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error or OTP invalid/expired
 */
router.post('/verify-otp', authVerifyOtp, otpController.verifyOtp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with WhatsApp number and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [whatsapp_number, password]
 *             properties:
 *               whatsapp_number:
 *                 type: string
 *                 example: 6281234567890
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLogin, authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, authController.me);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     tags: [Auth]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, whatsapp_number]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe Updated
 *               whatsapp_number:
 *                 type: string
 *                 example: 6281234567891
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/me',
  authenticate,
  authUpdateProfile,
  authController.updateProfile,
);

/**
 * @swagger
 * /auth/me/password:
 *   put:
 *     tags: [Auth]
 *     summary: Change current user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [old_password, new_password]
 *             properties:
 *               old_password:
 *                 type: string
 *                 example: secret123
 *               new_password:
 *                 type: string
 *                 example: newsecret456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid old password
 */
router.put(
  '/me/password',
  authenticate,
  authChangePassword,
  authController.changePassword,
);

/**
 * @swagger
 * /auth/me/telegram/link-token:
 *   post:
 *     tags: [Auth]
 *     summary: Generate a one-time Telegram link token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Link token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/me/telegram/link-token',
  authenticate,
  authController.telegramLinkToken,
);

/**
 * @swagger
 * /auth/me/telegram/status:
 *   get:
 *     tags: [Auth]
 *     summary: Get Telegram link status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Telegram link status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/me/telegram/status', authenticate, authController.telegramStatus);

module.exports = router;
