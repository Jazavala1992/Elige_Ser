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
import { pool } from '../db.js';

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

// Debug endpoint para pacientes
router.get('/debug/pacientes/:id', 
  async (req, res) => {
    try {
      console.log('DEBUG: Iniciando debug de pacientes', req.params.id);
      
      let connection;
      try {
        connection = await pool.getConnection();
        
        // Verificar tabla Pacientes
        const [tables] = await connection.query("SHOW TABLES LIKE 'Pacientes'");
        console.log('DEBUG: Tabla Pacientes encontrada:', tables.length > 0);
        
        if (tables.length > 0) {
          // Verificar estructura
          const [columns] = await connection.query("DESCRIBE Pacientes");
          console.log('DEBUG: Columnas en Pacientes:', columns.map(c => c.Field));
          
          // Intentar consulta
          const [pacientes] = await connection.query(`
            SELECT * FROM Pacientes WHERE id_usuario = ? LIMIT 5
          `, [req.params.id]);
          
          res.json({
            debug: true,
            tableExists: true,
            columns: columns.map(c => c.Field),
            totalPacientes: pacientes.length,
            pacientes: pacientes
          });
        } else {
          res.json({
            debug: true,
            tableExists: false,
            error: 'Tabla Pacientes no encontrada'
          });
        }
        
      } finally {
        if (connection) connection.release();
      }
      
    } catch (error) {
      console.error('DEBUG PACIENTES ERROR:', error);
      res.status(500).json({
        debug: true,
        error: error.message,
        stack: error.stack
      });
    }
  }
);

export default router;