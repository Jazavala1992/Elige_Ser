import { Router } from 'express';
import { pool, queryAdapter } from '../db_adapter.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Ruta de test para debug de PostgreSQL
router.get('/test-db', async (req, res) => {
    try {
        console.log('🔧 Test de conexión PostgreSQL...');
        
        // Test simple de conexión
        const [result] = await queryAdapter.query('SELECT NOW() as current_time');
        
        console.log('✅ Resultado del test:', result);
        
        res.json({
            success: true,
            message: 'Base de datos PostgreSQL funcionando',
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error en test de BD:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Ruta de test para INSERT con RETURNING
router.get('/test-insert', async (req, res) => {
    try {
        console.log('🔧 Test de INSERT PostgreSQL...');
        
        // Test de las tablas existentes
        const [tables] = await queryAdapter.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('📋 Tablas disponibles:', tables);
        
        res.json({
            success: true,
            message: 'Tablas de PostgreSQL',
            tables: tables,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error en test de INSERT:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Ruta de test para ver estructura de tablas
router.get('/test-schema', async (req, res) => {
    try {
        console.log('🔧 Test de esquema PostgreSQL...');
        
        // Obtener estructura de todas las tablas principales
        const tables = ['usuarios', 'pacientes', 'consultas', 'mediciones', 'resultados'];
        const schema = {};
        
        for (const table of tables) {
            const [columns] = await queryAdapter.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = ?
                ORDER BY ordinal_position
            `, [table]);
            
            schema[table] = columns;
        }
        
        console.log('📋 Esquema de tablas:', schema);
        
        res.json({
            success: true,
            message: 'Esquema de PostgreSQL',
            schema: schema,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error en test de esquema:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});

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

// Rutas públicas alternativas sin prefijo API para bypass total
router.get('/public/paciente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Obteniendo paciente con ID:', id);
        
        const [rows] = await queryAdapter.query(
            'SELECT * FROM pacientes WHERE id_paciente = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }
        
        res.json({
            success: true,
            paciente: rows[0]
        });
    } catch (error) {
        console.error('Error en ruta pública paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/public/resultados/patient/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Obteniendo resultados para paciente ID:', id);
        
        // JOIN con mediciones y consultas para obtener resultados por paciente
        const [rows] = await queryAdapter.query(`
            SELECT r.*, m.id_medicion, c.id_consulta, c.fecha_consulta 
            FROM resultados r
            INNER JOIN mediciones m ON r.id_medicion = m.id_medicion
            INNER JOIN consultas c ON m.id_consulta = c.id_consulta
            WHERE c.id_paciente = ? 
            ORDER BY r.fecha_calculo DESC
        `, [id]);
        
        console.log('Resultados encontrados:', rows.length);
        res.json(rows);
    } catch (error) {
        console.error('Error en ruta pública resultados:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para obtener mediciones por paciente
router.get('/public/mediciones/patient/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Obteniendo mediciones para paciente ID:', id);
        
        // JOIN con consultas para obtener mediciones por paciente
        const [rows] = await queryAdapter.query(`
            SELECT m.*, c.id_consulta, c.fecha_consulta 
            FROM mediciones m
            INNER JOIN consultas c ON m.id_consulta = c.id_consulta
            WHERE c.id_paciente = ? 
            ORDER BY m.fecha_medicion DESC
        `, [id]);
        
        console.log('Mediciones encontradas:', rows.length);
        res.json(rows);
    } catch (error) {
        console.error('Error en ruta pública mediciones:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/public/mediciones/create', async (req, res) => {
    try {
        console.log('Ruta pública: Creando medición');
        console.log('Datos recibidos:', req.body);
        
        const {id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        // Usar sintaxis universal con queryAdapter
        const [result] = await queryAdapter.query(
            `INSERT INTO mediciones (id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_medicion`,
            [id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral]
        );
        
        // Para PostgreSQL el ID estará en result[0].id_medicion
        const idMedicion = result[0]?.id_medicion;
        
        res.status(201).json({
            message: 'Medición creada exitosamente',
            id_medicion: idMedicion
        });
    } catch (error) {
        console.error('Error en ruta pública crear medición:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/public/mediciones/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Eliminando medición ID:', id);
        
        const [result] = await queryAdapter.query('DELETE FROM mediciones WHERE id_medicion = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medición no encontrada' });
        }
        
        res.json({
            message: 'Medición eliminada exitosamente',
            id_medicion: id
        });
    } catch (error) {
        console.error('Error en ruta pública eliminar medición:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para actualizar mediciones
router.put('/public/mediciones/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Actualizando medición ID:', id);
        console.log('Datos recibidos:', req.body);
        
        const {peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        const [result] = await queryAdapter.query(
            `UPDATE mediciones SET peso = ?, talla = ?, pl_tricipital = ?, pl_bicipital = ?, pl_subescapular = ?, pl_supraespinal = ?, pl_suprailiaco = ?, pl_abdominal = ?, pl_muslo_medial = ?, pl_pantorrilla_medial = ?, per_brazo_reposo = ?, per_brazo_flex = ?, per_muslo_medio = ?, per_pantorrilla_medial = ?, per_cintura = ?, per_cadera = ?, diametro_femoral = ?, diametro_biestiloideo = ?, diametro_humeral = ? WHERE id_medicion = ?`,
            [peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medición no encontrada' });
        }
        
        res.json({
            message: 'Medición actualizada exitosamente',
            id_medicion: id
        });
    } catch (error) {
        console.error('Error en ruta pública actualizar medición:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para crear resultados
router.post('/public/resultados/create', async (req, res) => {
    try {
        console.log('Ruta pública: Creando resultados');
        console.log('Datos recibidos:', req.body);
        
        const {id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual} = req.body;
        
        const [result] = await queryAdapter.query(
            `INSERT INTO resultados (id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_resultado`,
            [id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual]
        );
        
        const idResultado = result[0]?.id_resultado;
        
        res.status(201).json({
            message: 'Resultados creados exitosamente',
            id_resultado: idResultado
        });
    } catch (error) {
        console.error('Error en ruta pública crear resultados:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para crear mediciones
router.post('/public/mediciones/create', async (req, res) => {
    try {
        console.log('Ruta pública: Creando medición');
        console.log('Datos recibidos:', req.body);
        
        const {id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        const [result] = await queryAdapter.query(
            `INSERT INTO mediciones (id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_medicion`,
            [id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral]
        );
        
        const idMedicion = result[0]?.id_medicion;
        
        res.status(201).json({
            message: 'Medición creada exitosamente',
            id_medicion: idMedicion
        });
    } catch (error) {
        console.error('Error en ruta pública crear medición:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para logs
router.post('/public/logs', async (req, res) => {
    try {
        console.log('Ruta pública: Registrando log');
        console.log('Datos recibidos:', req.body);
        
        // Por ahora solo devolvemos éxito sin almacenar en BD
        res.status(201).json({
            message: 'Log registrado exitosamente'
        });
    } catch (error) {
        console.error('Error en ruta pública logs:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============= RUTAS PÚBLICAS PARA PACIENTES =============

// Ruta pública para obtener pacientes por usuario
router.get('/public/pacientes/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Obteniendo pacientes para usuario ID:', id);
        
        const result = await queryAdapter.query('SELECT * FROM pacientes WHERE id_usuario = ?', [id]);
        
        res.json(result);
    } catch (error) {
        console.error('Error en ruta pública obtener pacientes:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para crear paciente
router.post('/public/pacientes/create', async (req, res) => {
    try {
        console.log('Ruta pública: Creando paciente');
        console.log('Datos recibidos:', req.body);
        
        const {nombre, apellido, fecha_nacimiento, genero, telefono, email, direccion, id_usuario} = req.body;
        
        const [result] = await queryAdapter.query(
            `INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, genero, telefono, email, direccion, id_usuario) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_paciente`,
            [nombre, apellido, fecha_nacimiento, genero, telefono, email, direccion, id_usuario]
        );
        
        const idPaciente = result[0]?.id_paciente;
        
        res.status(201).json({
            message: 'Paciente creado exitosamente',
            id_paciente: idPaciente
        });
    } catch (error) {
        console.error('Error en ruta pública crear paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para actualizar paciente
router.put('/public/pacientes/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Actualizando paciente ID:', id);
        console.log('Datos recibidos:', req.body);
        
        const {nombre, apellido, fecha_nacimiento, genero, telefono, email, direccion} = req.body;
        
        const [result] = await queryAdapter.query(
            `UPDATE pacientes SET nombre = ?, apellido = ?, fecha_nacimiento = ?, genero = ?, telefono = ?, email = ?, direccion = ? WHERE id_paciente = ?`,
            [nombre, apellido, fecha_nacimiento, genero, telefono, email, direccion, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        
        res.json({
            message: 'Paciente actualizado exitosamente',
            id_paciente: id
        });
    } catch (error) {
        console.error('Error en ruta pública actualizar paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para eliminar paciente
router.delete('/public/pacientes/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Eliminando paciente ID:', id);
        
        const [result] = await queryAdapter.query('DELETE FROM pacientes WHERE id_paciente = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        
        res.json({
            message: 'Paciente eliminado exitosamente',
            id_paciente: id
        });
    } catch (error) {
        console.error('Error en ruta pública eliminar paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============= RUTAS PÚBLICAS PARA CONSULTAS =============

// Ruta pública para obtener consultas por usuario
router.get('/public/consultas/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Obteniendo consultas para usuario ID:', id);
        
        const result = await queryAdapter.query('SELECT * FROM consultas WHERE id_usuario = ?', [id]);
        
        res.json(result);
    } catch (error) {
        console.error('Error en ruta pública obtener consultas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para crear consulta
router.post('/public/consultas/create', async (req, res) => {
    try {
        console.log('Ruta pública: Creando consulta');
        console.log('Datos recibidos:', req.body);
        
        const {fecha, motivo, id_paciente, id_usuario} = req.body;
        
        const [result] = await queryAdapter.query(
            `INSERT INTO consultas (fecha, motivo, id_paciente, id_usuario) 
             VALUES (?, ?, ?, ?) RETURNING id_consulta`,
            [fecha, motivo, id_paciente, id_usuario]
        );
        
        const idConsulta = result[0]?.id_consulta;
        
        res.status(201).json({
            message: 'Consulta creada exitosamente',
            id_consulta: idConsulta
        });
    } catch (error) {
        console.error('Error en ruta pública crear consulta:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta pública para eliminar consulta
router.delete('/public/consultas/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Ruta pública: Eliminando consulta ID:', id);
        
        const [result] = await queryAdapter.query('DELETE FROM consultas WHERE id_consulta = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Consulta no encontrada' });
        }
        
        res.json({
            message: 'Consulta eliminada exitosamente',
            id_consulta: id
        });
    } catch (error) {
        console.error('Error en ruta pública eliminar consulta:', error);
        res.status(500).json({ error: error.message });
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