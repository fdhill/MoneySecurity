const { Router } = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authenticate');

const router = Router();

router.post('/register', userController.store);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
