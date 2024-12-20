module.exports = (sequelize, DataTypes) => {
    const Reservation = sequelize.define('Reservation', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        sector: {
            type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
            allowNull: false,
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    }, {
        tableName: 'reservations',
        timestamps: false,
    });

    Reservation.associate = (models) => {
        Reservation.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return Reservation;
};
