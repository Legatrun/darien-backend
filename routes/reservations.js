const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/ReservationController');

router.post('/', ReservationController.create);
router.get('/', ReservationController.getAll);
router.get('/:id', ReservationController.getById);
router.put('/:id', ReservationController.update);
router.delete('/:id', ReservationController.delete);

module.exports = router;
