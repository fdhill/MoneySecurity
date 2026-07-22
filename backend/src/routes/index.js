const { Router } = require('express');

const healthRouter = require('./health');
const userRoutes = require('./userRoutes');

const router = Router();

router.use(healthRouter);
router.use('/users', userRoutes);

module.exports = router;
