import pkg from 'pg';
import './config.js'; // Asegurar que las variables de entorno se carguen
const { Pool } = pkg;

console.log('=== POSTGRESQL DATABASE CONFIGURATION ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('DB_HOST:', process.env.DB_HOST ? '✓ Set' : '✗ Missing');
console.log('DB_USER:', process.env.DB_USER ? '✓ Set' : '✗ Missing');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✓ Set' : '✗ Missing');
console.log('DB_NAME:', process.env.DB_NAME ? '✓ Set' : '✗ Missing');
console.log('DB_PORT:', process.env.DB_PORT ? '✓ Set' : '✗ Missing');
console.log('===============================================');

// Configuración de PostgreSQL
let pool;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL si está disponible (típico de Render)
  console.log('Using DATABASE_URL for connection');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // SSL requerido para Render
  });
} else {
  // Usar variables individuales
  console.log('Using individual environment variables');
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false } // SSL requerido para Render
  });
}

// Probar conexión al inicializar
async function testConnection() {
  try {
    console.log('🔄 Probando conexión PostgreSQL...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Conexión PostgreSQL exitosa');
    console.log('Server time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
}

// Event listeners
pool.on('connect', () => {
  console.log('✅ Nueva conexión PostgreSQL establecida');
});

pool.on('error', (err) => {
  console.error('❌ Error en el pool PostgreSQL:', err.message);
});

// Probar conexión
testConnection().then(success => {
  if (success) {
    console.log('✅ Base de datos PostgreSQL configurada correctamente');
  } else {
    console.error('❌ No se pudo establecer conexión con PostgreSQL');
  }
}).catch(error => {
  console.error('❌ Error al probar la conexión PostgreSQL:', error.message);
});

export { pool };
