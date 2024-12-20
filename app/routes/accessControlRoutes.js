const express = require('express');
const router = express.Router();
const accessControlController = require('../controllers/accessControlController');

// Ruta para control de accesos
router.post('/register', accessControlController.registerAccess);

module.exports = router;