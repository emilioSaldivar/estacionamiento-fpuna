const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Ruta para registrar usuarios
router.post('/register', userController.createUser);
// consultar usuarios
router.get('/', userController.getUsers);
// actualizar usuarios
router.put('/:id', userController.updateUser);
// eliminar usuarios
router.delete('/:id', userController.deleteUser);
// consultar usuarios por id
router.get('/:id', userController.getUserById);

module.exports = router;
