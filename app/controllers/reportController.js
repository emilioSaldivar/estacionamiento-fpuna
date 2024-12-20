const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

exports.getReports = async (req, res) => {
    const client = await pool.connect();
    try {
        const { startDate, endDate } = req.query;
        
        // 1. Ocupación actual por sector
        const sectorStatusResult = await client.query(
            'SELECT sector, total_places, occupied_places FROM sector_status'
        );
        const sectorOccupancy = sectorStatusResult.rows;

        // 2. Cantidad de entradas y salidas en el periodo
        // Si no se dan fechas, podemos omitir el filtro. Si se especifica startDate y endDate:
        let accessQuery = `
            SELECT action, COUNT(*) as count
            FROM access_controls
        `;
        const params = [];
        if (startDate && endDate) {
            accessQuery += ' WHERE timestamp BETWEEN $1 AND $2';
            params.push(startDate, endDate);
        }
        accessQuery += ' GROUP BY action';

        const accessLogsResult = await client.query(accessQuery, params);
        const accessStats = accessLogsResult.rows; // [{action: 'entry', count: 'X'}, {action: 'exit', count: 'Y'}]

        // 3. Uso de permisos: ¿Cuántos permisos están asignados y cuántos están en uso?
        // Ejemplo: cantidad de permisos vigentes en el periodo actual
        const permissionQuery = `
            SELECT sector, COUNT(*) AS total_permissions
            FROM parking_permissions
            GROUP BY sector
        `;
        const permissionResult = await client.query(permissionQuery);
        const permissionStats = permissionResult.rows; // [{sector: 'A', total_permissions: 'X'}, ...]

        // 4. Ingresos generados (opcional, requiere una tabla de pagos o facturas)
        // Suponiendo que existe una tabla `payments` con `amount` y `created_at`
        // Este es solo un ejemplo, puedes omitir si no implementaste pagos.
        /*
        let paymentsQuery = 'SELECT SUM(amount) as total_income FROM payments';
        const paymentParams = [];
        if (startDate && endDate) {
            paymentsQuery += ' WHERE created_at BETWEEN $1 AND $2';
            paymentParams.push(startDate, endDate);
        }

        const paymentsResult = await client.query(paymentsQuery, paymentParams);
        const totalIncome = paymentsResult.rows[0].total_income || 0;
        */

        res.json({
            sectorOccupancy,
            accessStats,
            permissionStats,
            // totalIncome
        });
    } catch (error) {
        console.error('Error al generar reportes:', error);
        res.status(500).json({
            message: 'Error al generar reportes',
            error: error.message,
        });
    } finally {
        client.release();
    }
};
