import { Router } from 'express';
import { pool, queryAdapter, DB_TYPE } from '../db_adapter.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/ping', async (req, res) => {
    try {
        const startTime = Date.now();
        const [rows] = await queryAdapter.query('SELECT 1 + 1 AS solution, NOW() as server_time');
        const endTime = Date.now();
        
        res.json({
            success: true,
            database_type: DB_TYPE,
            database_response: rows[0],
            connection_time_ms: endTime - startTime,
            database_config: {
                host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST || 'PostgreSQL Connection',
                port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT || '5432',
                database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB || process.env.DATABASE_URL ? 'Connected via URL' : 'Unknown',
                user: process.env.DB_USER || process.env.MYSQL_ADDON_USER || 'PostgreSQL User'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            success: false,
            database_type: DB_TYPE,
            error: 'Database connection failed',
            error_code: error.code,
            error_errno: error.errno,
            error_sqlState: error.sqlState,
            message: error.message,
            database_config: {
                host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST || 'PostgreSQL Connection',
                port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT || '5432',
                database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB || process.env.DATABASE_URL ? 'Connected via URL' : 'Unknown',
                user: process.env.DB_USER || process.env.MYSQL_ADDON_USER || 'PostgreSQL User'
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Ruta de prueba para verificar que las rutas API funcionan
router.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Las rutas API funcionan correctamente',
        routes_available: [
            'POST /api/mediciones/create',
            'GET /api/mediciones/patient/:id',
            'PUT /api/mediciones/update/:id',
            'DELETE /api/mediciones/delete/:id',
            'POST /api/resultados/create',
            'GET /api/resultados/patient/:id',
            'GET /api/paciente/:id'
        ],
        timestamp: new Date().toISOString()
    });
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
        const [basicResult] = await queryAdapter.query('SELECT 1 as test');
        const endTime1 = Date.now();
        tests.push({
            test: 'Basic Connection',
            success: true,
            time_ms: endTime1 - startTime1,
            result: basicResult[0]
        });

        // Test 2: Verificar hora del servidor (compatible con ambas DB)
        const startTime2 = Date.now();
        let timeQuery;
        if (DB_TYPE === 'postgres') {
            timeQuery = 'SELECT NOW() as server_time, version() as db_version';
        } else {
            timeQuery = 'SELECT NOW() as server_time, @@version as db_version';
        }
        const [timeResult] = await queryAdapter.query(timeQuery);
        const endTime2 = Date.now();
        tests.push({
            test: 'Server Info',
            success: true,
            time_ms: endTime2 - startTime2,
            result: timeResult[0]
        });

        // Test 3: Mostrar tablas
        const startTime3 = Date.now();
        let tablesQuery;
        if (DB_TYPE === 'postgres') {
            tablesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'";
        } else {
            tablesQuery = 'SHOW TABLES';
        }
        const [tablesResult] = await queryAdapter.query(tablesQuery);
        const endTime3 = Date.now();
        
        let tableNames;
        if (DB_TYPE === 'postgres') {
            tableNames = tablesResult.map(row => row.table_name);
        } else {
            tableNames = tablesResult.map(row => Object.values(row)[0]);
        }
        
        tests.push({
            test: 'Show Tables',
            success: true,
            time_ms: endTime3 - startTime3,
            tables_count: tablesResult.length,
            tables: tableNames
        });

        res.json({
            success: true,
            message: 'All database tests passed',
            tests: tests,
            total_tests: tests.length,
            database_type: DB_TYPE,
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

// Endpoint temporal para crear el esquema de la base de datos PostgreSQL
router.get('/setup-database', async (req, res) => {
    try {
        console.log('🔧 Ejecutando setup de base de datos...');
        
        // SQL para crear todas las tablas
        const statements = [
            `CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido_paterno VARCHAR(100) NOT NULL,
                apellido_materno VARCHAR(100),
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS pacientes (
                id_paciente SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido_paterno VARCHAR(100) NOT NULL,
                apellido_materno VARCHAR(100),
                fecha_nacimiento DATE NOT NULL,
                sexo CHAR(1) CHECK (sexo IN ('M', 'F')) NOT NULL,
                telefono VARCHAR(15),
                email VARCHAR(150),
                direccion TEXT,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS consultas (
                id_consulta SERIAL PRIMARY KEY,
                id_paciente INTEGER NOT NULL REFERENCES pacientes(id_paciente) ON DELETE CASCADE,
                fecha_consulta DATE NOT NULL,
                hora TIME,
                observaciones TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS mediciones (
                id_medicion SERIAL PRIMARY KEY,
                id_consulta INTEGER NOT NULL REFERENCES consultas(id_consulta) ON DELETE CASCADE,
                peso DECIMAL(5,2),
                talla DECIMAL(5,2),
                pl_tricipital DECIMAL(4,1),
                pl_bicipital DECIMAL(4,1),
                pl_subescapular DECIMAL(4,1),
                pl_supraespinal DECIMAL(4,1),
                pl_suprailiaco DECIMAL(4,1),
                pl_abdominal DECIMAL(4,1),
                pl_muslo_medial DECIMAL(4,1),
                pl_pantorrilla_medial DECIMAL(4,1),
                per_brazo_reposo DECIMAL(4,1),
                per_brazo_flex DECIMAL(4,1),
                per_muslo_medio DECIMAL(4,1),
                per_pantorrilla_medial DECIMAL(4,1),
                per_cintura DECIMAL(4,1),
                per_cadera DECIMAL(4,1),
                diametro_humeral DECIMAL(4,1),
                diametro_biestiloideo DECIMAL(4,1),
                diametro_femoral DECIMAL(4,1),
                fecha_medicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS resultados (
                id_resultado SERIAL PRIMARY KEY,
                id_medicion INTEGER NOT NULL REFERENCES mediciones(id_medicion) ON DELETE CASCADE,
                imc DECIMAL(5,2),
                suma_pliegues DECIMAL(6,2),
                porcentaje_grasa DECIMAL(5,2),
                masa_muscular_kg DECIMAL(5,2),
                porcentaje_masa_muscular DECIMAL(5,2),
                masa_osea DECIMAL(5,2),
                masa_residual DECIMAL(5,2),
                fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON consultas(id_paciente)',
            'CREATE INDEX IF NOT EXISTS idx_mediciones_consulta ON mediciones(id_consulta)',
            'CREATE INDEX IF NOT EXISTS idx_resultados_medicion ON resultados(id_medicion)',
            'CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email)',
            'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)'
        ];

        const results = [];
        
        // Ejecutar creación de tablas
        for (const statement of statements) {
            try {
                await queryAdapter.query(statement);
                results.push({ 
                    statement: statement.substring(0, 50) + '...', 
                    success: true 
                });
            } catch (error) {
                results.push({ 
                    statement: statement.substring(0, 50) + '...', 
                    success: false, 
                    error: error.message 
                });
            }
        }

        // Ejecutar índices
        for (const index of indexes) {
            try {
                await queryAdapter.query(index);
                results.push({ 
                    statement: index.substring(0, 50) + '...', 
                    success: true 
                });
            } catch (error) {
                results.push({ 
                    statement: index.substring(0, 50) + '...', 
                    success: false, 
                    error: error.message 
                });
            }
        }

        // Insertar usuario admin
        try {
            await queryAdapter.query(`
                INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (email) DO NOTHING
            `, ['Admin', 'System', 'User', 'admin@admin.com', 'admin123']);
            results.push({ statement: 'INSERT admin user', success: true });
        } catch (error) {
            results.push({ 
                statement: 'INSERT admin user', 
                success: false, 
                error: error.message 
            });
        }

        // Verificar tablas creadas
        const [tables] = await queryAdapter.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        res.json({
            success: true,
            message: 'Database setup completed successfully',
            results: results,
            tables_created: tables.map(t => t.table_name),
            total_operations: results.length,
            successful_operations: results.filter(r => r.success).length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error setting up database:', error);
        res.status(500).json({
            success: false,
            error: 'Database setup failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Endpoint de debug para probar middleware
router.get('/debug-auth', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Authentication successful',
        user: req.user,
        userId: req.userId,
        timestamp: new Date().toISOString()
    });
});

// Endpoint temporal para obtener usuario admin sin autenticación
router.get('/usuario-temp/1', async (req, res) => {
    try {
        const [result] = await queryAdapter.query('SELECT * FROM usuarios WHERE id_usuario = ?', [1]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Endpoint temporal para listar todos los usuarios
router.get('/usuarios-temp', async (req, res) => {
    try {
        const [result] = await queryAdapter.query('SELECT id_usuario, nombre, apellido_paterno, email FROM usuarios');
        res.json({
            success: true,
            usuarios: result,
            count: result.length
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Endpoint temporal para obtener cualquier usuario por ID
router.get('/usuario-temp/:id', async (req, res) => {
    try {
        const [result] = await queryAdapter.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.params.id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Endpoint para actualizar la estructura de la tabla pacientes (sin autenticación)
router.get('/update-pacientes-table', async (req, res) => {
    try {
        console.log('🔧 Actualizando estructura de tabla pacientes...');
        
        // Primero verificar si la tabla existe
        const [existingTable] = await queryAdapter.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'pacientes'
        `);

        if (existingTable.length > 0) {
            // Hacer backup de datos existentes si los hay
            const [existingData] = await queryAdapter.query('SELECT * FROM pacientes');
            
            // Eliminar tabla antigua
            await queryAdapter.query('DROP TABLE IF EXISTS pacientes CASCADE');
            console.log('✅ Tabla antigua eliminada');
        }

        // Crear nueva tabla con estructura actualizada
        const newTableSQL = `
            CREATE TABLE pacientes (
                id_paciente SERIAL PRIMARY KEY,
                id_usuario INTEGER NOT NULL,
                nombre VARCHAR(255) NOT NULL,
                fecha_nacimiento DATE NOT NULL,
                sexo CHAR(1) CHECK (sexo IN ('M', 'F')) NOT NULL,
                telefono VARCHAR(15),
                ocupacion VARCHAR(255),
                nivel_actividad VARCHAR(50) CHECK (nivel_actividad IN ('Bajo', 'Moderado', 'Alto')),
                objetivo TEXT,
                horas_sueno INTEGER,
                habitos TEXT,
                antecedentes TEXT,
                activo BOOLEAN DEFAULT TRUE,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await queryAdapter.query(newTableSQL);
        console.log('✅ Nueva tabla pacientes creada');

        // Recrear índice
        await queryAdapter.query('CREATE INDEX IF NOT EXISTS idx_pacientes_usuario ON pacientes(id_usuario)');
        
        res.json({
            success: true,
            message: 'Tabla pacientes actualizada exitosamente',
            new_structure: [
                'id_paciente', 'id_usuario', 'nombre', 'fecha_nacimiento', 'sexo',
                'telefono', 'ocupacion', 'nivel_actividad', 'objetivo', 
                'horas_sueno', 'habitos', 'antecedentes', 'activo', 'fecha_registro'
            ],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error actualizando tabla pacientes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar tabla pacientes',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;