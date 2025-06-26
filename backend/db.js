import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // Configuración para Clever Cloud (límite de 5 conexiones)
  connectionLimit: 3,        // Máximo 3 conexiones concurrentes
  acquireTimeout: 60000,     // Tiempo de espera para obtener conexión
  timeout: 60000,            // Timeout general
  reconnect: true,           // Reconnectar automáticamente
  idleTimeout: 300000,       // Cerrar conexiones inactivas después de 5 min
  // Configuración adicional para production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos exitosa');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error.message);
    return false;
  }
};

