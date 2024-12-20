module.exports = (sequelize, DataTypes) => {
    const ParkingPermission = sequelize.define('ParkingPermission', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        category: {
            type: DataTypes.ENUM('estudiante', 'docente', 'administrativo'),
            allowNull: false,
        },
        accessstart: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        accessend: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        sector: {
            type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'), 
            allowNull: false,
        },
    }, {
        tableName: 'parking_permissions',
        timestamps: true,
    });

    ParkingPermission.associate = (models) => {
        ParkingPermission.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return ParkingPermission;
};
