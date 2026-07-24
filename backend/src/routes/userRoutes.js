const { Router } = require('express');
const userController = require('../controllers/userController');
const {authorize} = require('../middlewares/authenticate')

const router = Router();

router.get('/', authorize(1), userController.index);
router.get('/:id', authorize(1), userController.show);
router.post('/', authorize(1), userController.store);
router.put('/:id', authorize(1), userController.update);
router.delete('/:id', authorize(1), userController.destroy);

module.exports = router;
