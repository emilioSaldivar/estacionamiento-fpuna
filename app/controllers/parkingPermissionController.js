const { ParkingPermission, User } = require('../models');

exports.createPermission = async (req, res) => {
    try {
        const { userId, category, accessstart, accessend, sector } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const permission = await ParkingPermission.create({
            userId,
            category,
            accessstart,
            accessend,
            sector,  // Agregar el sector
        });

        res.status(201).json({
            message: 'Permiso creado exitosamente',
            permission,
        });
    } catch (error) {
        console.error('Error al crear el permiso:', error);
        res.status(500).json({
            message: 'Error al crear el permiso',
            error: error.message,
        });
    }
};


exports.getPermissions = async (req, res) => {
    try {
        const permissions = await ParkingPermission.findAll({
            include: {
                model: User,
                as: 'user',
                attributes: ['name', 'email'],
            },
        });

        res.json({ permissions });
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({
            message: 'Error al obtener permisos',
            error: error.message,
        });
    }
};


// Modificar permisos

exports.updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, accessstart, accessend, sector } = req.body;

        const permission = await ParkingPermission.findByPk(id);
        if (!permission) {
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }

        await permission.update({
            category,
            accessstart,
            accessend,
            sector,  // Agregar el sector
        });

        res.json({ message: 'Permiso actualizado exitosamente', permission });
    } catch (error) {
        console.error('Error al actualizar el permiso:', error);
        res.status(500).json({
            message: 'Error al actualizar el permiso',
            error: error.message,
        });
    }
};


// Eliminar permisos

exports.deletePermission = async (req, res) => {
    try {
        const { id } = req.params;

        const permission = await ParkingPermission.findByPk(id);
        if (!permission) {
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }

        await permission.destroy();

        res.json({ message: 'Permiso eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el permiso:', error);
        res.status(500).json({
            message: 'Error al eliminar el permiso',
            error: error.message,
        });
    }
};

// Obtener permisos por usuario

exports.getPermissionsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const permissions = await ParkingPermission.findAll({
            where: { userId },
            include: {
                model: User,
                as: 'user',
                attributes: ['name', 'email'],
            },
        });

        res.json({ permissions });
    } catch (error) {
        console.error('Error al obtener permisos por usuario:', error);
        res.status(500).json({
            message: 'Error al obtener permisos por usuario',
            error: error.message,
        });
    }
};

