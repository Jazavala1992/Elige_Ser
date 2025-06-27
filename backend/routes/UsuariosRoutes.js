import { Router } from "express";
import { registerUsuario, loginUsuario, getUsuario, deleteUsuario, updateUsuario, getPacientesPorUsuario } from "../controllers/UsuariosControllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validateUserUpdate, 
  validateUserId,
  sanitizeInput 
} from "../middlewares/validationMiddleware.js";
import { validationResult, param } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { pool } from '../db.js';

// Rate limiting específico para autenticación - más permisivo en desarrollo
const isProduction = process.env.NODE_ENV === 'production';

const authLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min en prod, 5 min en dev
  max: isProduction ? 5 : 50, // 5 intentos en prod, 50 en dev
  message: { 
    success: false, 
    error: 'Demasiados intentos de login, intenta de nuevo más tarde' 
  }
});

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

const router = Router();

// Rutas públicas
router.post("/register", 
  sanitizeInput,
  validateUserRegistration, 
  handleValidationErrors,
  registerUsuario
);

router.post("/login", 
  authLimiter,
  sanitizeInput,
  validateUserLogin, 
  handleValidationErrors,
  loginUsuario
);

// Debug endpoint público para verificar el estado del rate limiting
router.get("/debug/rate-limit-status", (req, res) => {
  const rateLimitInfo = req.rateLimit || {};
  
  res.json({
    debug: true,
    message: "Estado del rate limiting",
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    ip: req.ip,
    rateLimitSettings: {
      authLimiter: {
        windowMs: isProduction ? "15 min" : "5 min",
        maxAttempts: isProduction ? 5 : 50,
        production: isProduction
      }
    },
    currentLimits: rateLimitInfo,
    recommendation: isProduction ? 
      "En producción: límites estrictos aplicados" : 
      "En desarrollo: límites relajados para testing"
  });
});

// Rutas protegidas
router.get("/usuario/:id", 
  sanitizeInput,
  validateUserId, 
  handleValidationErrors,
  verifyToken, 
  getUsuario
);

router.put("/usuario/:id_usuario", 
  sanitizeInput,
  param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo'),
  validateUserUpdate, 
  handleValidationErrors,
  verifyToken, 
  updateUsuario
);

router.delete("/usuario/:id_usuario", 
  sanitizeInput,
  param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo'),
  handleValidationErrors,
  verifyToken, 
  deleteUsuario
);

router.get("/usuario/:id_usuario/pacientes",
  sanitizeInput,
  param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo'),
  handleValidationErrors,
  verifyToken,
  getPacientesPorUsuario
);

// Debug endpoints temporales
router.get("/debug/usuario/:id", 
  async (req, res) => {
    try {
      console.log('DEBUG: Iniciando debug de usuario', req.params.id);
      
      // Test 1: Verificar conexión a DB
      let connection;
      try {
        connection = await pool.getConnection();
        console.log('DEBUG: Conexión a DB exitosa');
        
        // Test 2: Verificar si la tabla existe
        const [tables] = await connection.query("SHOW TABLES LIKE 'Usuarios'");
        console.log('DEBUG: Tabla Usuarios encontrada:', tables.length > 0);
        
        if (tables.length > 0) {
          // Test 3: Verificar estructura de tabla
          const [columns] = await connection.query("DESCRIBE Usuarios");
          console.log('DEBUG: Columnas en Usuarios:', columns.map(c => c.Field));
          
          // Test 4: Intentar consulta
          const [users] = await connection.query(
            "SELECT id_usuario, nombre, username, email FROM Usuarios WHERE id_usuario = ? LIMIT 1",
            [req.params.id]
          );
          console.log('DEBUG: Usuario encontrado:', users.length > 0);
          
          res.json({
            debug: true,
            dbConnection: true,
            tableExists: true,
            columns: columns.map(c => c.Field),
            userFound: users.length > 0,
            user: users[0] || null
          });
        } else {
          res.json({
            debug: true,
            dbConnection: true,
            tableExists: false,
            error: 'Tabla Usuarios no encontrada'
          });
        }
        
      } finally {
        if (connection) connection.release();
      }
      
    } catch (error) {
      console.error('DEBUG ERROR:', error);
      res.status(500).json({
        debug: true,
        error: error.message,
        stack: error.stack
      });
    }
  }
);

export default router;