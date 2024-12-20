module.exports = (sequelize, DataTypes) => {
    const AccessControl = sequelize.define('AccessControl', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        vehiclePlate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        action: { // Entrada o salida
            type: DataTypes.ENUM('entrada', 'salida'),
            allowNull: false,
        },
        sector: {
            type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    }, {
        tableName: 'access_controls',
        timestamps: true,
    });

    AccessControl.associate = (models) => {
        // Relaciones con modelos si fuera necesario
    };

    return AccessControl;
};
