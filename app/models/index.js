require('dotenv').config();
const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.js');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.DB_DIALECT || 'postgres',
  port: process.env.DB_PORT || 5432,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Vehicle = require('./Vehicle')(sequelize, Sequelize.DataTypes);
db.ParkingPermission = require('./ParkingPermission')(sequelize, Sequelize.DataTypes);
db.AccessControl = require('./AccessControl')(sequelize, Sequelize.DataTypes);
db.SectorStatus = require('./SectorStatus')(sequelize, Sequelize.DataTypes);
db.Reservation = require('./Reservation')(sequelize, Sequelize.DataTypes);
// Configurar asociaciones
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
