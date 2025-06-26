import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 2,        // Reducir a 2 conexiones
  waitForConnections: true,
  queueLimit: 0,
  idleTimeout: 60000,       // Cerrar conexiones inactivas después de 1 minuto
  acquireTimeout: 60000     // Timeout para obtener conexión
});

