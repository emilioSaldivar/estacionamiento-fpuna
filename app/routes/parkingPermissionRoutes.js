const express = require('express');
const router = express.Router();
const parkingPermissionController = require('../controllers/parkingPermissionController');

//crear permisos
router.post('/create', parkingPermissionController.createPermission);
//obtnar todos los permisos
router.get('/', parkingPermissionController.getPermissions);
//actualizar permisos
router.put('/:id', parkingPermissionController.updatePermission);
//eliminar permisos
router.delete('/:id', parkingPermissionController.deletePermission);
//obtener permisos por usuario
router.get('/user/:userId', parkingPermissionController.getPermissionsByUserId);


module.exports = router;
