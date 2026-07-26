const { Router } = require('express');
const budgetController = require('../controllers/budgetController');

const router = Router();

router.get('/', budgetController.indexTemplates);
router.get('/:id', budgetController.showTemplate);
router.post('/', budgetController.storeTemplate);
router.put('/:id', budgetController.updateTemplate);
router.delete('/:id', budgetController.destroyTemplate);
router.get('/:id/instance', budgetController.activeInstance);
router.get('/instances/:id/summary', budgetController.instanceSummary);

module.exports = router;
