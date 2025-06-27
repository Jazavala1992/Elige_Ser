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

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
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

export default router;