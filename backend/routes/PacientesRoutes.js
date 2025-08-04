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

// Debug endpoint público para verificar estructura de tabla Pacientes
router.get("/debug/table-structure", 
  async (req, res) => {
    try {
      console.log('DEBUG: Verificando estructura de tabla Pacientes');
      
      let connection;
      try {
        connection = await pool.getConnection();
        
        // Verificar si la tabla existe
        const [tables] = await connection.query("SHOW TABLES LIKE 'Pacientes'");
        console.log('DEBUG: Tabla Pacientes encontrada:', tables.length > 0);
        
        if (tables.length > 0) {
          // Verificar estructura de tabla
          const [columns] = await connection.query("DESCRIBE Pacientes");
          console.log('DEBUG: Columnas en Pacientes:', columns.map(c => c.Field));
          
          res.json({
            debug: true,
            tableExists: true,
            columns: columns.map(c => ({
              field: c.Field,
              type: c.Type,
              null: c.Null,
              key: c.Key,
              default: c.Default
            })),
            message: "Estructura de tabla Pacientes obtenida exitosamente"
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
      console.error('DEBUG PACIENTES STRUCTURE ERROR:', error);
      res.status(500).json({
        debug: true,
        error: error.message,
        stack: error.stack
      });
    }
  }
);

// Rutas protegidas

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
        
        // Verificar tabla pacientes
        const [tables] = await connection.query("SHOW TABLES LIKE 'pacientes'");
        console.log('DEBUG: Tabla pacientes encontrada:', tables.length > 0);
        
        if (tables.length > 0) {
          // Verificar estructura
          const [columns] = await connection.query("DESCRIBE pacientes");
          console.log('DEBUG: Columnas en pacientes:', columns.map(c => c.Field));
          
          // Intentar consulta
          const [pacientes] = await connection.query(`
            SELECT * FROM pacientes WHERE id_usuario = ? LIMIT 5
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

// Ruta para obtener un paciente específico por ID
router.get('/paciente/:id_paciente', 
  verifyToken,
  param('id_paciente').isInt().withMessage('ID del paciente debe ser un número entero'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id_paciente } = req.params;
      console.log('Obteniendo paciente con ID:', id_paciente);
      
      let connection;
      try {
        connection = await pool.getConnection();
        
        const [rows] = await connection.query(
          'SELECT * FROM pacientes WHERE id_paciente = ?',
          [id_paciente]
        );
        
        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Paciente no encontrado'
          });
        }
        
        res.json({
          success: true,
          paciente: rows[0]
        });
        
      } finally {
        if (connection) connection.release();
      }
      
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

// Ruta alternativa para obtener paciente sin autenticación
router.get('/api/paciente/:id_paciente', 
  param('id_paciente').isInt().withMessage('ID del paciente debe ser un número entero'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id_paciente } = req.params;
      console.log('Ruta alternativa: Obteniendo paciente con ID:', id_paciente);
      
      let connection;
      try {
        connection = await pool.getConnection();
        
        const [rows] = await connection.query(
          'SELECT * FROM pacientes WHERE id_paciente = ?',
          [id_paciente]
        );
        
        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Paciente no encontrado'
          });
        }
        
        res.json({
          success: true,
          paciente: rows[0]
        });
        
      } finally {
        if (connection) connection.release();
      }
      
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

export default router;