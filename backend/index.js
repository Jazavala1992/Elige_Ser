import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import winston from 'winston';
import { PORT } from './config.js';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import MonitoringService from './services/MonitoringService.js';

// IMPORTAR TODAS LAS RUTAS
import indexRoutes from './routes/index.routes.js';
import usuariosRoutes from './routes/UsuariosRoutes.js';
import pacientesRoutes from './routes/PacientesRoutes.js';
import consultaRoutes from './routes/ConsultaRoutes.js';
import medicionesRoutes from './routes/MedicionesRoutes.js';
import resultadosRoutes from './routes/ResultadosRoutes.js';
import registrosRoutes from './routes/RegistrosRoutes.js';

// CONFIGURACIÓN DE LOGGER
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'elijeser-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' 
      ? [new winston.transports.Console({
          format: winston.format.simple()
        })] 
      : []
    )
  ]
});

const app = express();

// MIDDLEWARE DE SEGURIDAD
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// COMPRESIÓN
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { 
    success: false, 
    error: 'Demasiadas peticiones, intenta de nuevo más tarde' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rate limiting específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 intentos de login por IP
  message: { 
    success: false, 
    error: 'Demasiados intentos de login, intenta de nuevo más tarde' 
  }
});

// CORS
app.use(cors({
  origin: [
    'https://elige-ser.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// MIDDLEWARE DE PARSING
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.options('*', cors());

// MIDDLEWARE DE VALIDACIÓN GLOBAL
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', { errors: errors.array(), ip: req.ip });
    return res.status(400).json({ 
      success: false, 
      message: 'Datos de entrada inválidos',
      errors: errors.array() 
    });
  }
  next();
};

// MIDDLEWARE DE LOGGING DE REQUESTS CON FILTROS
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Filtrar health checks de Render para reducir logs
    const isHealthCheck = req.get('User-Agent')?.includes('Go-http-client') ||
                         req.url === '/health' ||
                         req.url === '/ping' ||
                         req.url === '/';
    
    if (!isHealthCheck) {
      MonitoringService.logRequest(req, res, duration);
    } else {
      // Log mínimo para health checks
      logger.debug('Health check request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent')
      });
    }
  });
  
  next();
});

// NUEVAS RUTAS DE MONITOREO
app.get('/health', async (req, res) => {
  try {
    const health = await MonitoringService.healthCheck();
    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/metrics', async (req, res) => {
  try {
    const metrics = MonitoringService.getMetrics();
    const systemResources = MonitoringService.checkSystemResources();
    
    res.json({
      success: true,
      metrics,
      system: systemResources,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve metrics'
    });
  }
});

app.get('/alerts', async (req, res) => {
  try {
    const alerts = await MonitoringService.checkAlerts();
    res.json({
      success: true,
      alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alerts'
    });
  }
});

// RUTAS PÚBLICAS (sin autenticación)
app.get('/', (req, res) => {
  res.json({ 
    message: 'ElijeSer Backend API is running!', 
    status: 'OK',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    const health = await MonitoringService.healthCheck();
    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

// ENDPOINT ESPECÍFICO PARA RENDER HEALTH CHECK
app.get('/render-health', (req, res) => {
  res.status(200).send('OK');
});

// ENDPOINT PARA RENDER STATUS
app.get('/status', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'elijeser-backend',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// USAR TODAS LAS RUTAS
app.use('/', indexRoutes);
app.use('/', usuariosRoutes);
app.use('/', pacientesRoutes);
app.use('/', consultaRoutes);
app.use('/', medicionesRoutes);
app.use('/', resultadosRoutes);
app.use('/', registrosRoutes);

// RUTAS BÁSICAS (mantener estas como backup)
app.get('/', (req, res) => {
  res.json({ message: 'ElijeSer Backend API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// HEALTH DB
app.get('/health/db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    const [users] = await connection.query("SELECT id_usuario, nombre, username, email FROM Usuarios");
    
    res.json({ 
      status: 'OK', 
      database: 'Connected', 
      timestamp: new Date().toISOString(),
      total_users: users.length,
      users: users
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({ status: 'Error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// ENDPOINT OPTIMIZADO PARA OBTENER USUARIO
app.get('/usuario/:id', [
  body('id').optional().isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo')
], async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "ID de usuario inválido" 
      });
    }

    logger.info('Fetching user', { userId: id, ip: req.ip });

    connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT id_usuario, nombre, username, email, created_at FROM Usuarios WHERE id_usuario = ? LIMIT 1", 
      [id]
    );

    if (result.length === 0) {
      logger.warn('User not found', { userId: id });
      return res.status(404).json({ 
        success: false, 
        message: "Usuario no encontrado" 
      });
    }

    const responseData = {
      success: true,
      user: {
        id: result[0].id_usuario,
        nombre: result[0].nombre,
        username: result[0].username,
        email: result[0].email,
        created_at: result[0].created_at
      }
    };

    logger.info('User fetched successfully', { userId: id });
    res.json(responseData);
  } catch (error) {
    logger.error("Error fetching user:", { error: error.message, userId: req.params.id });
    res.status(500).json({ 
      success: false, 
      message: "Error interno del servidor"
    });
  } finally {
    if (connection) connection.release();
  }
});

// MIDDLEWARE GLOBAL DE MANEJO DE ERRORES
app.use((error, req, res, next) => {
  logger.error('Error global:', { 
    error: error.message, 
    stack: error.stack, 
    url: req.url, 
    method: req.method,
    ip: req.ip 
  });
  
  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
  
  // Error de JWT expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Token expirado' 
    });
  }
  
  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
  
  // Error de base de datos
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      success: false, 
      message: 'Registro duplicado' 
    });
  }
  
  if (error.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({ 
      success: false, 
      message: 'Error de configuración de base de datos' 
    });
  }
  
  // Error de conexión a BD
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({ 
      success: false, 
      message: 'Servicio temporalmente no disponible' 
    });
  }
  
  // Error genérico
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.message 
    })
  });
});

// MIDDLEWARE PARA RUTAS NO ENCONTRADAS
app.use('*', (req, res) => {
  logger.warn('Route not found', { url: req.url, method: req.method, ip: req.ip });
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// INICIAR SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`, { 
    port: PORT, 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});