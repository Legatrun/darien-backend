const express = require('express');
const router = express.Router();
const SpaceController = require('../controllers/SpaceController');

router.post('/', SpaceController.create);
router.get('/', SpaceController.getAll);
router.get('/statuses', SpaceController.getAllStatuses);
router.get('/:id', SpaceController.getById);
router.put('/:id', SpaceController.update);
router.delete('/:id', SpaceController.delete);

// IoT Routes
router.post('/:id/desired', SpaceController.updateDesired);
router.get('/:id/status', SpaceController.getStatus);

module.exports = router;
