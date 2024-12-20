const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

exports.createReservation = async (req, res) => {
    const client = await pool.connect();
    try {
        const { userId, sector, start_time, end_time } = req.body;

        if (!userId || !sector || !start_time || !end_time) {
            client.release();
            return res.status(400).json({ message: 'Datos incompletos para la reserva' });
        }
        

        // Iniciar transacción
        await client.query('BEGIN');

        // Verificar sector_status
        const sectorStatusResult = await client.query(
            'SELECT * FROM sector_status WHERE sector = $1',
            [sector]
        );
        const sectorStatus = sectorStatusResult.rows[0];

        if (!sectorStatus) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ message: 'Sector no encontrado' });
        }

        if (sectorStatus.occupied_places >= sectorStatus.total_places) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(403).json({ message: 'El sector está lleno, no se puede reservar' });
        }

        // Crear la reserva
        const reservationResult = await client.query(
            `INSERT INTO reservations (id, "userId", sector, start_time, end_time, createAt, updatedAt)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [userId, sector, start_time, end_time]
        );
        const reservation = reservationResult.rows[0];

        // Actualizar la ocupación del sector
        await client.query(
            `UPDATE sector_status 
             SET occupied_places = occupied_places + 1
             WHERE sector = $1`,
            [sector]
        );

        // Obtener datos del usuario
        const userResult = await client.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Crear la notificación
        const message = `Su reserva en el sector ${sector} desde ${start_time} hasta ${end_time} se ha realizado con éxito.`;
        const notificationResult = await client.query(
            `INSERT INTO notifications (id, "userId", message, type, created_at)
             VALUES (gen_random_uuid(), $1, $2, 'reservation', NOW())
             RETURNING *`,
            [userId, message]
        );
        const notification = notificationResult.rows[0];

        // Confirmar la transacción
        await client.query('COMMIT');

        // Enviar el correo electrónico
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: "Confirmación de Reserva de Estacionamiento",
            text: `
                Estimado/a ${user.name}:

                Su reserva en el sector ${sector} ha sido confirmada.
                Fecha y hora: ${start_time} - ${end_time}

                ¡Gracias por utilizar nuestro sistema!
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo:", error);
            } else {
                console.log("Correo enviado: " + info.response);
            }
        });

        res.status(201).json({
            message: 'Reserva creada y notificación enviada con éxito',
            reservation,
            notification
        });

    } catch (error) {
        console.error('Error al crear la reserva:', error);
        await pool.query('ROLLBACK');
        res.status(500).json({
            message: 'Error al crear la reserva',
            error: error.message,
        });
    } finally {
        client.release();
    }
};
