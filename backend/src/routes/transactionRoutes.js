const { Router } = require('express');
const transactionController = require('../controllers/transactionController');

const router = Router();

router.get('/', transactionController.index);
router.get('/:id', transactionController.show);
router.post('/', transactionController.store);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.destroy);

module.exports = router;
