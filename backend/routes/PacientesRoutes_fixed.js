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

// ===== ENDPOINTS DE DEBUG =====

// Debug endpoint público para verificar estructura de tabla Pacientes
router.get("/debug/table-structure", 
  async (req, res) => {
    try {
      console.log('DEBUG: Verificando estructura de tabla pacientes con PostgreSQL');
      
      // Verificar si la tabla existe en PostgreSQL
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'pacientes'
      `);
      console.log('DEBUG: Tabla pacientes encontrada:', tables.rows.length > 0);
      
      if (tables.rows.length > 0) {
        // Verificar estructura de tabla PostgreSQL
        const columns = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'pacientes' 
          ORDER BY ordinal_position
        `);
        console.log('DEBUG: Columnas en pacientes:', columns.rows.map(c => c.column_name));
          
        res.json({
          debug: true,
          tableExists: true,
          columns: columns.rows.map(c => ({
            field: c.column_name,
            type: c.data_type,
            nullable: c.is_nullable,
            default: c.column_default
          })),
          message: "Estructura de tabla pacientes obtenida exitosamente"
        });
      } else {
        res.json({
          debug: true,
          tableExists: false,
          error: 'Tabla pacientes no encontrada'
        });
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

// Debug endpoint para contar pacientes por usuario
router.get('/debug/pacientes/:id', 
  async (req, res) => {
    try {
      console.log('DEBUG: Iniciando debug de pacientes para usuario', req.params.id);
      
      // Verificar tabla pacientes con PostgreSQL
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'pacientes'
      `);
      console.log('DEBUG: Tabla pacientes encontrada:', tables.rows.length > 0);
      
      if (tables.rows.length > 0) {
        // Obtener pacientes del usuario
        const pacientes = await pool.query(`
          SELECT * FROM pacientes WHERE id_usuario = $1 LIMIT 5
        `, [req.params.id]);
        
        res.json({
          debug: true,
          tableExists: true,
          totalPacientes: pacientes.rows.length,
          pacientes: pacientes.rows
        });
      } else {
        res.json({
          debug: true,
          tableExists: false,
          error: 'Tabla pacientes no encontrada'
        });
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

// ===== RUTAS CRUD PRINCIPALES =====

// GET todos los pacientes de un usuario
router.get('/pacientes/:id', 
  sanitizeInput,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  handleValidationErrors,
  verifyToken, 
  getPacientes
);

// POST crear nuevo paciente
router.post('/pacientes', 
  sanitizeInput,
  validatePatientCreation,
  handleValidationErrors,
  verifyToken, 
  createPacientes
);

// PUT actualizar paciente
router.put('/pacientes/:id', 
  sanitizeInput,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  validatePatientUpdate,
  handleValidationErrors,
  verifyToken, 
  updatePacientes
);

// DELETE eliminar paciente
router.delete('/pacientes/:id', 
  sanitizeInput,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  handleValidationErrors,
  verifyToken, 
  deletePacientes
);

// ===== RUTAS ALTERNATIVAS SIN AUTH (SOLO PARA TESTING) =====

// Ruta para obtener un paciente específico por ID (sin auth para testing)
router.get('/paciente/:id_paciente', 
  param('id_paciente').isInt().withMessage('ID del paciente debe ser un número entero'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id_paciente } = req.params;
      console.log('Obteniendo paciente con ID:', id_paciente);
      
      const result = await pool.query(
        'SELECT * FROM pacientes WHERE id_paciente = $1',
        [id_paciente]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }
      
      res.json({
        success: true,
        paciente: result.rows[0]
      });
      
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

// Ruta para obtener todos los pacientes (sin auth para testing)
router.get('/pacientes', 
  async (req, res) => {
    try {
      console.log('Obteniendo todos los pacientes');
      
      const result = await pool.query('SELECT * FROM pacientes ORDER BY fecha_registro DESC LIMIT 10');
      
      res.json({
        success: true,
        totalPacientes: result.rows.length,
        pacientes: result.rows
      });
      
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

export default router;
