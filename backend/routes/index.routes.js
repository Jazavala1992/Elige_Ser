import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/ping', async (req, res) => {
    try {
        const startTime = Date.now();
        const [rows] = await pool.query('SELECT 1 + 1 AS solution, NOW() as server_time');
        const endTime = Date.now();
        
        res.json({
            success: true,
            database_response: rows[0],
            connection_time_ms: endTime - startTime,
            database_config: {
                host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST,
                port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT,
                database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB,
                user: process.env.DB_USER || process.env.MYSQL_ADDON_USER
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Database connection failed',
            error_code: error.code,
            error_errno: error.errno,
            error_sqlState: error.sqlState,
            message: error.message,
            database_config: {
                host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST,
                port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT,
                database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB,
                user: process.env.DB_USER || process.env.MYSQL_ADDON_USER
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Endpoint de salud básico que no depende de la DB
router.get('/health-basic', (req, res) => {
    res.json({
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Endpoint para probar la conexión con más detalle
router.get('/test-db-connection', async (req, res) => {
    const tests = [];
    
    try {
        // Test 1: Conexión básica
        const startTime1 = Date.now();
        const [basicResult] = await pool.query('SELECT 1 as test');
        const endTime1 = Date.now();
        tests.push({
            test: 'Basic Connection',
            success: true,
            time_ms: endTime1 - startTime1,
            result: basicResult[0]
        });

        // Test 2: Verificar hora del servidor
        const startTime2 = Date.now();
        const [timeResult] = await pool.query('SELECT NOW() as server_time, @@version as mysql_version');
        const endTime2 = Date.now();
        tests.push({
            test: 'Server Info',
            success: true,
            time_ms: endTime2 - startTime2,
            result: timeResult[0]
        });

        // Test 3: Mostrar tablas (solo nombres)
        const startTime3 = Date.now();
        const [tablesResult] = await pool.query('SHOW TABLES');
        const endTime3 = Date.now();
        tests.push({
            test: 'Show Tables',
            success: true,
            time_ms: endTime3 - startTime3,
            tables_count: tablesResult.length,
            tables: tablesResult.map(row => Object.values(row)[0])
        });

        res.json({
            success: true,
            message: 'All database tests passed',
            tests: tests,
            total_tests: tests.length,
            database_config: {
                host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST,
                port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT,
                database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB,
                user: process.env.DB_USER || process.env.MYSQL_ADDON_USER
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        tests.push({
            test: 'Failed',
            success: false,
            error_code: error.code,
            error_message: error.message
        });

        res.status(500).json({
            success: false,
            message: 'Database connection test failed',
            tests: tests,
            error: {
                code: error.code,
                errno: error.errno,
                message: error.message,
                sqlState: error.sqlState
            },
            database_config: {
                host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST,
                port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT,
                database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB,
                user: process.env.DB_USER || process.env.MYSQL_ADDON_USER
            },
            timestamp: new Date().toISOString()
        });
    }
});

export default router;