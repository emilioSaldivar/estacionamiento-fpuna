module.exports = (sequelize, DataTypes) => {
    const Vehicle = sequelize.define('Vehicle', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      plate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'vehicles',
      timestamps: true,
    });
  
    Vehicle.associate = (models) => {
      Vehicle.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
      });
    };
  
    return Vehicle;
  };
  