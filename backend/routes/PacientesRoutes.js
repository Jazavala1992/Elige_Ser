import {Router} from 'express';
import { verifyToken } from "../middlewares/authMiddleware.js";
import { 
    getPacientes, 
    createPacientes, 
    updatePacientes, 
    deletePacientes
} from '../controllers/PacienteControllers.js';
import { 
  validatePatientCreation, 
  validatePatientUpdate, 
  validatePatientId,
  sanitizeInput 
} from "../middlewares/validationMiddleware.js";
import { validationResult, param } from 'express-validator';

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

router.get('/pacientes/:id', 
  sanitizeInput,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  handleValidationErrors,
  verifyToken, 
  getPacientes
);

router.post('/pacientes', 
  sanitizeInput,
  validatePatientCreation,
  handleValidationErrors,
  verifyToken, 
  createPacientes
);

router.put('/pacientes/:id', 
  sanitizeInput,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  validatePatientUpdate,
  handleValidationErrors,
  verifyToken, 
  updatePacientes
);

router.delete('/pacientes/:id', 
  sanitizeInput,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  handleValidationErrors,
  verifyToken, 
  deletePacientes
);

export default router;