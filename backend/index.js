import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import './db_postgres.js'; // Inicializar conexión PostgreSQL
import indexRoutes from './routes/index.routes.js';
import PacientesRoutes from './routes/PacientesRoutes.js';
import UsuariosRoutes from './routes/UsuariosRoutes.js';
import ConsultasRoutes from './routes/ConsultaRoutes.js';
import MedicionesRoutes from './routes/MedicionesRoutes.js';
import ResultadosRoutes from './routes/ResultadosRoutes.js';
import RegistrosRoutes from './routes/RegistrosRoutes.js';

const app = express();

// Configuración CORS para desarrollo y producción
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://elige-ser.netlify.app',
    'https://elige-ser-frontend.onrender.com',
    'https://elige-ser.onrender.com'
  ],
  credentials: true
};

app.use(cors(corsOptions)); // Habilita CORS para el frontend
app.use(express.json()); // Habilita el manejo de JSON en las solicitudes

// Ruta básica sin dependencias
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor ElijeSer funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Ruta de prueba global para verificar que no hay middleware global
app.get('/api/test-global', (req, res) => {
    res.json({
        success: true,
        message: 'Ruta global de prueba funcionando sin autenticación',
        timestamp: new Date().toISOString()
    });
});

// Ruta de prueba POST directa en index.js
app.post('/api/test-post-direct', (req, res) => {
    res.json({
        success: true,
        message: 'POST directo funcionando',
        body: req.body,
        timestamp: new Date().toISOString()
    });
});

// Ruta de prueba de conexión a la base de datos
app.get('/api/test-db-connection', async (req, res) => {
    try {
        const { queryAdapter } = await import('./db_adapter.js');
        console.log("🔧 Test - Verificando conexión a la base de datos");
        
        // Consulta simple para verificar conexión
        const [result] = await queryAdapter.query('SELECT 1 as test');
        
        res.json({
            success: true,
            message: 'Conexión a la base de datos exitosa',
            data: result[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error conexión DB:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Ruta de prueba simple INSERT pacientes
app.post('/api/simple-insert-paciente', async (req, res) => {
    try {
        const { queryAdapter } = await import('./db_adapter.js');
        console.log("🔧 Test - INSERT simple paciente");
        
        // INSERT simple con valores mínimos usando sintaxis MySQL (? se convierte automáticamente)
        const [result] = await queryAdapter.query(`
            INSERT INTO pacientes (id_usuario, nombre, fecha_nacimiento, sexo) 
            VALUES (?, ?, ?, ?) 
            RETURNING id_paciente, nombre
        `, [1, 'Test User', '1990-01-01', 'M']);
        
        res.json({
            success: true,
            message: 'Paciente creado exitosamente',
            data: result[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error INSERT simple:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Ruta para verificar datos en tabla usuarios
app.get('/api/check-usuarios', async (req, res) => {
    try {
        const { queryAdapter } = await import('./db_adapter.js');
        console.log("🔧 Test - Verificando usuarios existentes");
        
        // Verificar qué usuarios existen
        const [usuarios] = await queryAdapter.query('SELECT id_usuario, nombre, email FROM usuarios LIMIT 5');
        
        res.json({
            success: true,
            message: 'Usuarios encontrados',
            usuarios: usuarios,
            count: usuarios.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error verificando usuarios:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Ruta para verificar estructura de tablas
app.get('/admin/test-db-tables', async (req, res) => {
    try {
        const { queryAdapter } = await import('./db_adapter.js');
        console.log("🔧 Test - Verificando tablas existentes");
        
        // Verificar qué tablas existen
        const [tables] = await queryAdapter.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        res.json({
            success: true,
            message: 'Tablas encontradas',
            tables: tables,
            count: tables.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error verificando tablas:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Ruta para verificar estructura de tabla pacientes
app.get('/admin/pacientes-schema', async (req, res) => {
    try {
        const { queryAdapter } = await import('./db_adapter.js');
        console.log("🔧 Test - Verificando estructura tabla pacientes");
        
        // Verificar estructura de la tabla pacientes
        const [columns] = await queryAdapter.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'pacientes' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        res.json({
            success: true,
            message: 'Estructura tabla pacientes',
            columns: columns,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error verificando estructura:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ===============================================
// RUTAS DE TESTING CRUD COMPLETO SIN AUTENTICACIÓN
// ===============================================

// PACIENTES - CRUD COMPLETO
app.post('/api/test/pacientes', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 POST Test - Creando paciente:", req.body);
        const {id_usuario, nombre, fecha_nacimiento, sexo, telefono, ocupacion} = req.body;
        
        const [result] = await queryAdapter.query(
            'INSERT INTO pacientes (id_usuario, nombre, fecha_nacimiento, sexo, telefono, ocupacion) VALUES (?, ?, ?, ?, ?, ?) RETURNING id_paciente',
            [id_usuario, nombre, fecha_nacimiento, sexo, telefono, ocupacion]
        );
        
        res.status(201).json({
            success: true,
            message: 'Paciente creado exitosamente',
            data: result[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error POST pacientes:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/test/pacientes/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 GET Test - Obteniendo paciente:", req.params.id);
        const [result] = await queryAdapter.query('SELECT * FROM pacientes WHERE id_paciente = ?', [req.params.id]);
        
        res.json({
            success: true,
            data: result[0] || null,
            found: result.length > 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error GET paciente:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/test/pacientes/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 PUT Test - Actualizando paciente:", req.params.id, req.body);
        const {nombre, telefono, ocupacion} = req.body;
        
        const [result] = await queryAdapter.query(
            'UPDATE pacientes SET nombre = ?, telefono = ?, ocupacion = ? WHERE id_paciente = ?',
            [nombre, telefono, ocupacion, req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Paciente actualizado exitosamente',
            id_paciente: req.params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error PUT paciente:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/test/pacientes/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 DELETE Test - Eliminando paciente:", req.params.id);
        
        const [result] = await queryAdapter.query('DELETE FROM pacientes WHERE id_paciente = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Paciente eliminado exitosamente',
            id_paciente: req.params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error DELETE paciente:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// CONSULTAS - CRUD COMPLETO
app.post('/api/test/consultas', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 POST Test - Creando consulta:", req.body);
        const {id_paciente, fecha_consulta, hora, observaciones} = req.body;
        
        const [result] = await queryAdapter.query(
            'INSERT INTO consultas (id_paciente, fecha_consulta, hora, observaciones) VALUES (?, ?, ?, ?) RETURNING id_consulta',
            [id_paciente, fecha_consulta, hora, observaciones]
        );
        
        res.status(201).json({
            success: true,
            message: 'Consulta creada exitosamente',
            data: result[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error POST consultas:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/test/consultas/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 GET Test - Obteniendo consulta:", req.params.id);
        const [result] = await queryAdapter.query('SELECT * FROM consultas WHERE id_consulta = ?', [req.params.id]);
        
        res.json({
            success: true,
            data: result[0] || null,
            found: result.length > 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error GET consulta:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/test/consultas/paciente/:id_paciente', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 GET Test - Obteniendo consultas del paciente:", req.params.id_paciente);
        const [result] = await queryAdapter.query('SELECT * FROM consultas WHERE id_paciente = ? ORDER BY fecha_consulta DESC', [req.params.id_paciente]);
        
        res.json({
            success: true,
            count: result.length,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error GET consultas paciente:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/test/consultas/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 PUT Test - Actualizando consulta:", req.params.id, req.body);
        const {fecha_consulta, hora, observaciones} = req.body;
        
        const [result] = await queryAdapter.query(
            'UPDATE consultas SET fecha_consulta = ?, hora = ?, observaciones = ? WHERE id_consulta = ?',
            [fecha_consulta, hora, observaciones, req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Consulta actualizada exitosamente',
            id_consulta: req.params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error PUT consulta:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/test/consultas/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 DELETE Test - Eliminando consulta:", req.params.id);
        
        const [result] = await queryAdapter.query('DELETE FROM consultas WHERE id_consulta = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Consulta eliminada exitosamente',
            id_consulta: req.params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error DELETE consulta:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// MEDICIONES - CRUD COMPLETO
app.post('/api/test/mediciones', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 POST Test - Creando medición:", req.body);
        const {id_consulta, tipo_medicion, valor, unidad, notas} = req.body;
        
        const [result] = await queryAdapter.query(
            'INSERT INTO mediciones (id_consulta, tipo_medicion, valor, unidad, notas) VALUES (?, ?, ?, ?, ?) RETURNING id_medicion',
            [id_consulta, tipo_medicion, valor, unidad, notas]
        );
        
        res.status(201).json({
            success: true,
            message: 'Medición creada exitosamente',
            data: result[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error POST mediciones:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/test/mediciones/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 GET Test - Obteniendo medición:", req.params.id);
        const [result] = await queryAdapter.query('SELECT * FROM mediciones WHERE id_medicion = ?', [req.params.id]);
        
        res.json({
            success: true,
            data: result[0] || null,
            found: result.length > 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error GET medición:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/test/mediciones/consulta/:id_consulta', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 GET Test - Obteniendo mediciones de consulta:", req.params.id_consulta);
        const [result] = await queryAdapter.query('SELECT * FROM mediciones WHERE id_consulta = ? ORDER BY fecha_registro DESC', [req.params.id_consulta]);
        
        res.json({
            success: true,
            count: result.length,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error GET mediciones consulta:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/test/mediciones/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 PUT Test - Actualizando medición:", req.params.id, req.body);
        const {tipo_medicion, valor, unidad, notas} = req.body;
        
        const [result] = await queryAdapter.query(
            'UPDATE mediciones SET tipo_medicion = ?, valor = ?, unidad = ?, notas = ? WHERE id_medicion = ?',
            [tipo_medicion, valor, unidad, notas, req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Medición actualizada exitosamente',
            id_medicion: req.params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error PUT medición:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/test/mediciones/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 DELETE Test - Eliminando medición:", req.params.id);
        
        const [result] = await queryAdapter.query('DELETE FROM mediciones WHERE id_medicion = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Medición eliminada exitosamente',
            id_medicion: req.params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error DELETE medición:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// RESULTADOS - CRUD COMPLETO
app.post('/api/test/resultados', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 POST Test - Creando resultado:", req.body);
        const {id_consulta, tipo_resultado, valor_resultado, unidad_resultado, observaciones} = req.body;
        
        const [result] = await queryAdapter.query(
            'INSERT INTO resultados (id_consulta, tipo_resultado, valor_resultado, unidad_resultado, observaciones) VALUES (?, ?, ?, ?, ?) RETURNING id_resultado',
            [id_consulta, tipo_resultado, valor_resultado, unidad_resultado, observaciones]
        );
        
        res.status(201).json({
            success: true,
            message: 'Resultado creado exitosamente',
            data: result[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error POST resultados:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/test/resultados/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 GET Test - Obteniendo resultado:", req.params.id);
        const [result] = await queryAdapter.query('SELECT * FROM resultados WHERE id_resultado = ?', [req.params.id]);
        
        res.json({
            success: true,
            data: result[0] || null,
            found: result.length > 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error GET resultado:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/test/resultados/consulta/:id_consulta', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 GET Test - Obteniendo resultados de consulta:", req.params.id_consulta);
        const [result] = await queryAdapter.query('SELECT * FROM resultados WHERE id_consulta = ? ORDER BY fecha_registro DESC', [req.params.id_consulta]);
        
        res.json({
            success: true,
            count: result.length,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error GET resultados consulta:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/test/resultados/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 PUT Test - Actualizando resultado:", req.params.id, req.body);
        const {tipo_resultado, valor_resultado, unidad_resultado, observaciones} = req.body;
        
        const [result] = await queryAdapter.query(
            'UPDATE resultados SET tipo_resultado = ?, valor_resultado = ?, unidad_resultado = ?, observaciones = ? WHERE id_resultado = ?',
            [tipo_resultado, valor_resultado, unidad_resultado, observaciones, req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Resultado actualizado exitosamente',
            id_resultado: req.params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error PUT resultado:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/test/resultados/:id', async (req, res) => {
    const { queryAdapter } = await import('./db_adapter.js');
    try {
        console.log("🔧 DELETE Test - Eliminando resultado:", req.params.id);
        
        const [result] = await queryAdapter.query('DELETE FROM resultados WHERE id_resultado = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Resultado eliminado exitosamente',
            id_resultado: req.params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error DELETE resultado:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===============================
// FINALIZACION RUTAS CRUD TESTING
// ===============================

// Rutas - indexRoutes PRIMERO para que las rutas públicas tengan precedencia
app.use(indexRoutes);
app.use(UsuariosRoutes); 
app.use(PacientesRoutes);
app.use(ConsultasRoutes);
app.use(MedicionesRoutes);
app.use(ResultadosRoutes);
app.use(RegistrosRoutes);


// Inicia el servidor
app.listen(PORT);
console.log(`Server is running on port ${PORT}`);