import mysql from 'mysql2/promise';

// Log de variables de entorno para debug - Clever Cloud y estándar
console.log('=== DATABASE CONFIGURATION WITH SSL ===');
console.log('Standard variables:');
console.log('DB_HOST:', process.env.DB_HOST ? '✓ Set' : '✗ Missing');
console.log('DB_USER:', process.env.DB_USER ? '✓ Set' : '✗ Missing');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✓ Set' : '✗ Missing');
console.log('DB_NAME:', process.env.DB_NAME ? '✓ Set' : '✗ Missing');
console.log('DB_PORT:', process.env.DB_PORT ? '✓ Set' : '✗ Missing');
console.log('Clever Cloud variables:');
console.log('MYSQL_ADDON_HOST:', process.env.MYSQL_ADDON_HOST ? '✓ Set' : '✗ Missing');
console.log('MYSQL_ADDON_USER:', process.env.MYSQL_ADDON_USER ? '✓ Set' : '✗ Missing');
console.log('MYSQL_ADDON_PASSWORD:', process.env.MYSQL_ADDON_PASSWORD ? '✓ Set' : '✗ Missing');
console.log('MYSQL_ADDON_DB:', process.env.MYSQL_ADDON_DB ? '✓ Set' : '✗ Missing');
console.log('MYSQL_ADDON_PORT:', process.env.MYSQL_ADDON_PORT ? '✓ Set' : '✗ Missing');
console.log('==============================');

// Usar variables de Clever Cloud como prioritarias, luego las estándar
const dbConfig = {
  host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST,
  user: process.env.MYSQL_ADDON_USER || process.env.DB_USER,
  password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME,
  port: process.env.MYSQL_ADDON_PORT || process.env.DB_PORT,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  idleTimeout: 300000,
  maxIdle: 5,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
  // Configuración SSL para Clever Cloud
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('Final DB config:', {
  host: dbConfig.host ? '✓ Set' : '✗ Missing',
  user: dbConfig.user ? '✓ Set' : '✗ Missing', 
  password: dbConfig.password ? '✓ Set' : '✗ Missing',
  database: dbConfig.database ? '✓ Set' : '✗ Missing',
  port: dbConfig.port ? '✓ Set' : '✗ Missing',
  ssl: '✓ Enabled'
});

// Crear pool básico primero
let pool = mysql.createPool(dbConfig);

// Función para probar diferentes configuraciones
async function testConnection() {
  try {
    console.log('🔄 Probando conexión con SSL...');
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexión con SSL exitosa');
    return true;
  } catch (error) {
    console.log('❌ Conexión con SSL falló:', error.code, error.message);
    
    // Intentar sin SSL
    try {
      console.log('🔄 Probando conexión sin SSL...');
      const configWithoutSSL = { ...dbConfig };
      delete configWithoutSSL.ssl;
      
      const newPool = mysql.createPool(configWithoutSSL);
      const connection = await newPool.getConnection();
      await connection.ping();
      connection.release();
      
      console.log('✅ Conexión sin SSL exitosa, cambiando pool...');
      pool = newPool;
      return true;
    } catch (fallbackError) {
      console.error('❌ Ambas configuraciones fallaron');
      console.error('Error SSL:', error.message);
      console.error('Error sin SSL:', fallbackError.message);
      return false;
    }
  }
}

// Probar conexión al inicializar
testConnection().then(success => {
  if (success) {
    console.log('✅ Base de datos configurada correctamente');
  } else {
    console.error('❌ No se pudo establecer conexión con la base de datos');
  }
}).catch(error => {
  console.error('❌ Error al probar la conexión:', error.message);
});

// Event listeners para el pool
process.nextTick(() => {
  pool.on('connection', (connection) => {
    console.log('✅ Nueva conexión a la base de datos establecida');
  });

  pool.on('error', (err) => {
    console.error('❌ Error en el pool de conexión a la base de datos:', err.code);
    console.error('Detalles del error:', err.message);
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('La conexión con la base de datos se ha perdido. Intentando reconectar...');
    }
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Acceso denegado a la base de datos. Verifica las credenciales.');
    }
    
    if (err.code === 'ECONNREFUSED') {
      console.error('Conexión rechazada. Verifica host, puerto y firewall.');
    }
  });
});

export { pool };
