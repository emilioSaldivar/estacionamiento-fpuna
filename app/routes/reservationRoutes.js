const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// POST /reservations: Crear una nueva reserva
router.post('/', reservationController.createReservation);

module.exports = router;
