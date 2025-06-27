import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 10,           // Aumentado para producción
  waitForConnections: true,
  queueLimit: 0,
  acquireTimeout: 60000,         // Timeout para obtener conexión
  timeout: 60000,                // Timeout de query
  reconnect: true,               // Reconexión automática
  idleTimeout: 300000,           // 5 minutos de timeout para conexiones idle
  maxIdle: 5                     // Máximo 5 conexiones idle
});

