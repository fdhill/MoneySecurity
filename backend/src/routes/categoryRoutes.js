const { Router } = require('express');
const categoryController = require('../controllers/categoryController');

const router = Router();

router.get('/', categoryController.index);
router.get('/:id', categoryController.show);
router.post('/', categoryController.store);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.destroy);

module.exports = router;
