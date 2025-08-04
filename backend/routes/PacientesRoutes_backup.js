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
      console.log('DEBUG: Verificando estructura de tabla Pacientes con PostgreSQL');
      
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
      
      // Verificar tabla pacientes con PostgreSQL
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'pacientes'
      `);
      console.log('DEBUG: Tabla pacientes encontrada:', tables.rows.length > 0);
      
      if (tables.rows.length > 0) {
        // Verificar estructura con PostgreSQL
        const columns = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'pacientes' 
          ORDER BY ordinal_position
        `);
        console.log('DEBUG: Columnas en pacientes:', columns.rows.map(c => c.column_name));
        
        // Intentar consulta con PostgreSQL
        const pacientes = await pool.query(`
          SELECT * FROM pacientes WHERE id_usuario = $1 LIMIT 5
        `, [req.params.id]);
        
        res.json({
          debug: true,
          tableExists: true,
          columns: columns.rows.map(c => c.column_name),
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