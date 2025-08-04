import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('=== TESTING POSTGRESQL CONNECTION ===');
console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
console.log('Using DATABASE_URL for connection');

// Crear conexión SOLO con DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false  // SSL requerido pero sin verificación estricta de certificados
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 2
});

async function testConnection() {
  try {
    console.log('🔄 Iniciando conexión...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📅 Tiempo del servidor:', result.rows[0].current_time);
    console.log('🐘 Versión PostgreSQL:', result.rows[0].pg_version.split(' ')[0]);
    
    client.release();
    
    // Cerrar pool
    await pool.end();
    console.log('✅ Test completado exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testConnection();
