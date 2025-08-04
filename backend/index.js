import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import './db.js'; // Inicializar conexión PostgreSQL

// Importar todas las rutas
import PacientesRoutes from './routes/PacientesRoutes.js';
import UsuariosRoutes from './routes/UsuariosRoutes.js';
import ConsultasRoutes from './routes/ConsultaRoutes.js';
import MedicionesRoutes from './routes/MedicionesRoutes.js';
import ResultadosRoutes from './routes/ResultadosRoutes.js';
import RegistrosRoutes from './routes/RegistrosRoutes.js';

const app = express();

// ==================== CONFIGURACIÓN CORS ====================
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',  // Vite dev
            'http://localhost:3000',  // React dev
            'https://elije-ser.netlify.app',  // Producción Netlify
            'https://elige-ser.onrender.com',  // Producción Frontend Render
            'https://elije-ser.onrender.com'  // Producción Render alternativo
        ];
        
        // Permitir requests sin origin (como apps móviles, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware adicional para manejar preflight OPTIONS
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ==================== RUTAS DE SALUD Y DEBUG ====================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏥 API ElijeSer - PostgreSQL Backend',
        version: '2.0.0',
        database: 'PostgreSQL',
        status: 'Funcionando',
        timestamp: new Date().toISOString(),
        endpoints: {
            pacientes: '/api/pacientes',
            usuarios: '/api/usuarios',
            consultas: '/api/consultas',
            mediciones: '/api/mediciones',
            resultados: '/api/resultados',
            registros: '/api/registros',
            health: '/health'
        }
    });
});

// Ruta de salud para monitoreo
app.get('/health', async (req, res) => {
    try {
        const { queryAdapter } = await import('./db_adapter.js');
        const result = await queryAdapter('SELECT 1 as healthy');
        
        res.json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'Disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Endpoint de debug para verificar conexión PostgreSQL
app.get('/api/debug/connection', async (req, res) => {
    try {
        const { queryAdapter } = await import('./db_adapter.js');
        console.log("🔧 Debug - Verificando conexión PostgreSQL");
        
        const result = await queryAdapter('SELECT NOW() as current_time, version() as postgres_version');
        
        res.json({
            success: true,
            message: 'Conexión PostgreSQL exitosa',
            data: result[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error conexión PostgreSQL:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ==================== RUTAS PRINCIPALES ====================
console.log("📁 Configurando rutas de la aplicación...");

// Rutas de la API
app.use('/api', PacientesRoutes);
app.use('/api', UsuariosRoutes);
app.use('/api', ConsultasRoutes);
app.use('/api', MedicionesRoutes);
app.use('/api', ResultadosRoutes);
app.use('/api', RegistrosRoutes);

// ==================== MIDDLEWARE DE ERRORES ====================
// Middleware de manejo de errores
app.use((error, req, res, next) => {
    console.error('❌ Error no manejado:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
    console.log(`🚀 Servidor PostgreSQL ejecutándose en puerto ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`🔗 Salud: http://localhost:${PORT}/health`);
    console.log(`🔧 Debug: http://localhost:${PORT}/api/debug/connection`);
    console.log(`💾 Base de datos: PostgreSQL`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
});

export default app;
