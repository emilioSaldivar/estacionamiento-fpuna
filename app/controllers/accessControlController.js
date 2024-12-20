const { Pool } = require('pg');
require('dotenv').config();

// Configurar la conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Registrar entrada o salida de vehículos
exports.registerAccess = async (req, res) => {
    const client = await pool.connect();
    try {
        const { vehiclePlate, action, sector } = req.body; 
        // action: 'entry' o 'exit'

        // Verificar que el vehículo existe
        const vehicleResult = await client.query('SELECT * FROM vehicles WHERE plate = $1', [vehiclePlate]);
        const vehicle = vehicleResult.rows[0];
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        // Verificar que el vehículo tiene permiso para ese sector
        const permissionResult = await client.query(
            `SELECT * FROM parking_permissions 
             WHERE "userId" = $1 
             AND sector = $2 
             AND accessStart <= CURRENT_TIME
             AND accessEnd >= CURRENT_TIME`,
            [vehicle.user_id, sector]
        );
        const permission = permissionResult.rows[0];

        if (!permission) {
            return res.status(403).json({ message: 'Vehículo no autorizado para este sector o fuera del horario de acceso' });
        }

        // Verificar estado del sector
        const sectorStatusResult = await client.query(
            'SELECT total_places, occupied_places FROM sector_status WHERE sector = $1',
            [sector]
        );
        const sectorStatus = sectorStatusResult.rows[0];
        if (!sectorStatus) {
            return res.status(404).json({ message: 'El sector no existe en la tabla sector_status' });
        }

        // Si es entrada, verificar que haya lugares disponibles
        if (action === 'entry' && sectorStatus.occupied_places >= sectorStatus.total_places) {
            return res.status(403).json({ message: 'El sector está lleno, no hay lugares disponibles' });
        }

        // Registrar el acceso (entrada o salida)
        const accessResult = await client.query(
            `INSERT INTO access_controls (vehicle_plate, action, sector, timestamp) 
             VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [vehiclePlate, action, sector]
        );
        const access = accessResult.rows[0];

        // Actualizar el estado del sector
        if (action === 'entry') {
            await client.query(
                `UPDATE sector_status
                 SET occupied_places = occupied_places + 1, updated_at = NOW()
                 WHERE sector = $1`,
                [sector]
            );
        } else if (action === 'exit') {
            await client.query(
                `UPDATE sector_status
                 SET occupied_places = GREATEST(occupied_places - 1, 0), updated_at = NOW()
                 WHERE sector = $1`,
                [sector]
            );
        }

        res.status(201).json({
            message: `Registro de ${action} exitoso`,
            access,
        });
    } catch (error) {
        console.error('Error al registrar acceso:', error);
        res.status(500).json({
            message: 'Error al registrar acceso',
            error: error.message,
        });
    } finally {
        client.release();
    }
};

// Obtener registros de acceso
exports.getAccessLogs = async (req, res) => {
    const client = await pool.connect();
    try {
        const accessLogsResult = await client.query(
            'SELECT * FROM access_controls ORDER BY timestamp DESC'
        );
        const accessLogs = accessLogsResult.rows;

        res.json({ accessLogs });
    } catch (error) {
        console.error('Error al obtener registros de acceso:', error);
        res.status(500).json({
            message: 'Error al obtener registros de acceso',
            error: error.message,
        });
    } finally {
        client.release();
    }
};
