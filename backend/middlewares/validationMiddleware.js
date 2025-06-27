import { body, param, query } from 'express-validator';

// Validaciones para usuarios
export const validateUserRegistration = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('El username solo puede contener letras, números, guiones y guiones bajos'),
    
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email es demasiado largo'),
    
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial')
];

export const validateUserLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

export const validateUserUpdate = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('El username solo puede contener letras, números, guiones y guiones bajos'),
    
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
];

// Validaciones para pacientes
export const validatePatientCreation = [
  body('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número entero positivo'),
    
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  body('fecha_nacimiento')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        throw new Error('La edad debe estar entre 0 y 120 años');
      }
      return true;
    }),
    
  body('sexo')
    .isIn(['M', 'F', 'Otro'])
    .withMessage('El sexo debe ser M, F u Otro'),
    
  body('telefono')
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/)
    .withMessage('Número de teléfono inválido - debe contener entre 7 y 20 caracteres (números, espacios, guiones y paréntesis permitidos)'),
    
  body('ocupacion')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ocupación debe tener entre 2 y 100 caracteres'),
    
  body('nivel_actividad')
    .isIn(['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy Activo'])
    .withMessage('Nivel de actividad inválido'),
    
  body('objetivo')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('El objetivo debe tener entre 5 y 500 caracteres'),
    
  body('horas_sueno')
    .isFloat({ min: 0, max: 24 })
    .withMessage('Las horas de sueño deben estar entre 0 y 24'),
    
  body('habitos')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los hábitos no pueden exceder 1000 caracteres'),
    
  body('antecedentes')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los antecedentes no pueden exceder 1000 caracteres')
];

export const validatePatientUpdate = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  body('telefono')
    .optional()
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/)
    .withMessage('Número de teléfono inválido - debe contener entre 7 y 20 caracteres (números, espacios, guiones y paréntesis permitidos)'),
    
  body('ocupacion')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ocupación debe tener entre 2 y 100 caracteres'),
    
  body('nivel_actividad')
    .optional()
    .isIn(['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy Activo'])
    .withMessage('Nivel de actividad inválido'),
    
  body('objetivo')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('El objetivo debe tener entre 5 y 500 caracteres'),
    
  body('horas_sueno')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Las horas de sueño deben estar entre 0 y 24'),
    
  body('habitos')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los hábitos no pueden exceder 1000 caracteres'),
    
  body('antecedentes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los antecedentes no pueden exceder 1000 caracteres')
];

// Validaciones de parámetros
export const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número entero positivo')
];

export const validatePatientId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de paciente debe ser un número entero positivo')
];

// Validaciones de consultas
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100')
];

// Sanitización de datos
export const sanitizeInput = (req, res, next) => {
  // Sanitizar body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  
  // Sanitizar params
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].trim();
      }
    }
  }
  
  // Sanitizar query
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    }
  }
  
  next();
};
