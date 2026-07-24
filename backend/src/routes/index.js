const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');

const healthRouter = require('./health');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');

const router = Router();

// public
router.use(healthRouter);
router.use('/auth', authRoutes);

// semua route di bawah ini wajib login (token valid)
router.use(authenticate);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);

router.use((req, res) => {
  res.status(404);
  res.send('route not found');
});

module.exports = router;
