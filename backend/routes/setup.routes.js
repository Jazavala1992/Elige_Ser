import { Router } from 'express';
import { queryAdapter } from '../db_adapter.js';

const router = Router();

// Endpoint temporal para crear el esquema de la base de datos (sin autenticación)
router.get('/setup-database', async (req, res) => {
    try {
        console.log('🔧 Ejecutando setup de base de datos...');
        
        // SQL para crear todas las tablas
        const schema = `
            -- Tabla usuarios
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido_paterno VARCHAR(100) NOT NULL,
                apellido_materno VARCHAR(100),
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Tabla pacientes
            CREATE TABLE IF NOT EXISTS pacientes (
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
            );

            -- Tabla consultas
            CREATE TABLE IF NOT EXISTS consultas (
                id_consulta SERIAL PRIMARY KEY,
                id_paciente INTEGER NOT NULL REFERENCES pacientes(id_paciente) ON DELETE CASCADE,
                fecha_consulta DATE NOT NULL,
                hora TIME,
                observaciones TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Tabla mediciones
            CREATE TABLE IF NOT EXISTS mediciones (
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
            );

            -- Tabla resultados
            CREATE TABLE IF NOT EXISTS resultados (
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
            );
        `;

        // Ejecutar el esquema
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        const results = [];
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await queryAdapter.query(statement.trim());
                    results.push({ statement: statement.substring(0, 50) + '...', success: true });
                } catch (error) {
                    results.push({ 
                        statement: statement.substring(0, 50) + '...', 
                        success: false, 
                        error: error.message 
                    });
                }
            }
        }

        // Crear índices
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON consultas(id_paciente)',
            'CREATE INDEX IF NOT EXISTS idx_mediciones_consulta ON mediciones(id_consulta)',
            'CREATE INDEX IF NOT EXISTS idx_resultados_medicion ON resultados(id_medicion)',
            'CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email)',
            'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)'
        ];

        for (const index of indexes) {
            try {
                await queryAdapter.query(index);
                results.push({ statement: index.substring(0, 50) + '...', success: true });
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
            message: 'Database setup completed',
            results: results,
            tables_created: tables.map(t => t.table_name),
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

export default router;
