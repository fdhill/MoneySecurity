const { Router } = require('express');
const walletController = require('../controllers/walletController');

const router = Router();

router.get('/', walletController.index);
router.get('/:id', walletController.show);
router.post('/', walletController.store);
router.put('/:id', walletController.update);
router.delete('/:id', walletController.destroy);

module.exports = router;
