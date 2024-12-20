require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./app/models');
const userRoutes = require('./app/routes/userRoutes.js');
const parkingPermissionRoutes = require('./app/routes/parkingPermissionRoutes');
const accessControlController = require('./app/routes/accessControlRoutes');
const reportsRoutes = require('./app/routes/reportRoutes');
const reservationRoutes = require('./app/routes/reservationRoutes');

db.sequelize.sync({ force: false }) // Cambia a true solo si necesitas recrear las tablas
  .then(() => console.log('Base de datos sincronizada.'))
  .catch(err => console.error('Error al sincronizar la base de datos:', err));


// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/parking', parkingPermissionRoutes);
app.use('/api/access', accessControlController);
app.use('/api/reports', reportsRoutes);
app.use('/api/reservations', reservationRoutes);
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Sistema de Estacionamientos funcionando');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
