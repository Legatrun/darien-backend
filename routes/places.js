const express = require('express');
const router = express.Router();
const PlaceController = require('../controllers/PlaceController');

router.post('/', PlaceController.create);
router.get('/', PlaceController.getAll);

module.exports = router;
