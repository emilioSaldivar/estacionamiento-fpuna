const bcrypt = require('bcrypt');
const db = require('../models');
const User = db.User;
const Vehicle = db.Vehicle;

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, vehicles } = req.body;

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Crear vehículos asociados
    if (vehicles && vehicles.length > 0) {
      for (const vehicle of vehicles) {
        await Vehicle.create({
          ...vehicle,
          userId: user.id,
        });
      }
    }

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user,
    });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({
      message: 'Error al crear el usuario',
      error: error.message,
    });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    // Comparar contraseñas
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Contraseña incorrecta',
      });
    }

    res.json({
      message: 'Usuario logueado exitosamente',
      user,
    });
    } catch (error) {
    console.error('Error al loguear el usuario:', error);
    res.status(500).json({
      message: 'Error al loguear el usuario',
      error: error.message,
    });
    }
}


// Consultar usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Vehicle,
        as: 'vehicles', // Especifica el alias usado en la asociación
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error al consultar los usuarios:', error);
    res.status(500).json({
      message: 'Error al consultar los usuarios',
      error: error.message,
    });
  }
};

// Actualizar usuario y sus vehículos
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, vehicles } = req.body;

    // Buscar el usuario
    const user = await User.findByPk(id, {
      include: {
        model: Vehicle,
        as: 'vehicles', // Incluye los vehículos asociados al usuario
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    // Actualizar la información básica del usuario
    user.name = name;
    user.email = email;
    user.role = role;

    await user.save();

    // Actualizar los vehículos asociados

    // 1. Eliminar vehículos que no están en el array de vehículos (si existen en la base de datos)
    if (vehicles && vehicles.length > 0) {
      // Buscar los IDs de los vehículos actuales
      const currentVehicleIds = user.vehicles.map(vehicle => vehicle.id);

      // Buscar los IDs de los vehículos enviados
      const newVehicleIds = vehicles.map(vehicle => vehicle.id);

      // Eliminar los vehículos que no están en el array de nuevos vehículos
      const vehiclesToDelete = currentVehicleIds.filter(id => !newVehicleIds.includes(id));
      if (vehiclesToDelete.length > 0) {
        await Vehicle.destroy({
          where: {
            id: vehiclesToDelete,
            userId: user.id,
          },
        });
      }

      // 2. Agregar nuevos vehículos o actualizar los existentes
      for (const vehicle of vehicles) {
        if (vehicle.id) {
          // Si el vehículo tiene un id, actualizarlo
          await Vehicle.update(vehicle, {
            where: {
              id: vehicle.id,
              userId: user.id,
            },
          });
        } else {
          // Si el vehículo no tiene un id, crear uno nuevo
          await Vehicle.create({
            ...vehicle,
            userId: user.id,
          });
        }
      }
    }

    res.json({
      message: 'Usuario y vehículos actualizados exitosamente',
      user,
    });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({
      message: 'Error al actualizar el usuario',
      error: error.message,
    });
  }
};

// eliminar usuarios
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    await user.destroy();

    res.json({
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({
      message: 'Error al eliminar el usuario',
      error: error.message,
    });
  }
};
// consultar usuarios por id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: Vehicle,
    });

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al consultar el usuario:', error);
    res.status(500).json({
      message: 'Error al consultar el usuario',
      error: error.message,
    });
  }
};
