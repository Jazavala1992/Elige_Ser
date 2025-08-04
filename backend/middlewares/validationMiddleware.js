import { body, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Middleware para sanitizar entrada
export const sanitizeInput = (req, res, next) => {
  // Sanitizar strings básicamente removiendo caracteres especiales
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  }
  next();
};

// Validaciones para pacientes - sincronizado con PacienteControllers.js
export const validatePatientCreation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('fecha_nacimiento')
    .notEmpty()
    .withMessage('La fecha de nacimiento es requerida')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe tener formato válido (YYYY-MM-DD)'),
  
  body('sexo')
    .notEmpty()
    .withMessage('El sexo es requerido')
    .isIn(['M', 'F'])
    .withMessage('El sexo debe ser M o F'),
  
  body('telefono')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres'),
  
  body('ocupacion')
    .notEmpty()
    .withMessage('La ocupación es requerida'),
  
  body('nivel_actividad')
    .notEmpty()
    .withMessage('El nivel de actividad es requerido'),
  
  body('objetivo')
    .notEmpty()
    .withMessage('El objetivo es requerido'),
  
  body('horas_sueno')
    .isInt({ min: 1, max: 24 })
    .withMessage('Las horas de sueño deben ser un número entre 1 y 24'),
  
  body('habitos')
    .notEmpty()
    .withMessage('Los hábitos son requeridos'),
  
  body('antecedentes')
    .notEmpty()
    .withMessage('Los antecedentes son requeridos')
];

export const validatePatientUpdate = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('fecha_nacimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe tener formato válido (YYYY-MM-DD)'),
  
  body('sexo')
    .optional()
    .isIn(['M', 'F'])
    .withMessage('El sexo debe ser M o F'),
  
  body('telefono')
    .optional()
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres'),
  
  body('horas_sueno')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Las horas de sueño deben ser un número entre 1 y 24')
];

export const validatePatientId = [
  body('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo')
];

// Validaciones para consultas
export const validateConsultaCreation = [
  body('id_paciente')
    .notEmpty()
    .withMessage('El ID del paciente es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del paciente debe ser un número entero positivo'),
  
  body('fecha_consulta')
    .notEmpty()
    .withMessage('La fecha de consulta es requerida')
    .isISO8601()
    .withMessage('La fecha de consulta debe tener formato válido (YYYY-MM-DD)'),
  
  body('hora')
    .notEmpty()
    .withMessage('La hora es requerida')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora debe tener formato HH:MM'),
  
  body('observaciones')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no deben exceder 500 caracteres')
];

export const validateConsultaUpdate = [
  body('fecha_consulta')
    .optional()
    .isISO8601()
    .withMessage('La fecha de consulta debe tener formato válido (YYYY-MM-DD)'),
  
  body('hora')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora debe tener formato HH:MM'),
  
  body('observaciones')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no deben exceder 500 caracteres')
];
