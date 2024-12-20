module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('estudiante', 'docente', 'administrativo'),
        allowNull: false,
      },
    }, {
      tableName: 'users',
      timestamps: true,
    });
  
    User.associate = (models) => {
      User.hasMany(models.Vehicle, {
        foreignKey: 'userId',
        as: 'vehicles',
      });
    };
  
    return User;
  };
  