import { body, validationResult } from 'express-validator';

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

// Validaciones para pacientes
export const validatePatientCreation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  
  body('edad')
    .isInt({ min: 0, max: 150 })
    .withMessage('La edad debe ser un número entre 0 y 150'),
  
  body('telefono')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('El teléfono debe tener entre 10 y 15 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
];

export const validatePatientUpdate = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('apellido')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  
  body('edad')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('La edad debe ser un número entre 0 y 150'),
  
  body('telefono')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('El teléfono debe tener entre 10 y 15 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
];

export const validatePatientId = [
  body('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo')
];
