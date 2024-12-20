module.exports = (sequelize, DataTypes) => {
    const SectorStatus = sequelize.define('SectorStatus', {
        sector: {
            type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'), // Enum que define los sectores
            primaryKey: true,
            allowNull: false,
        },
        total_places: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        occupied_places: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    }, {
        tableName: 'sector_status',
        timestamps: false, // Usamos el campo `updated_at` manualmente, sin usar `createdAt` y `updatedAt` automáticos de Sequelize
    });

    return SectorStatus;
};
