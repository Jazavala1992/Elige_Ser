import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

// CORS
app.use(cors({
  origin: [
    'https://elige-ser.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.options('*', cors());

// RUTAS BÁSICAS SIN BASE DE DATOS
app.get('/', (req, res) => {
  res.json({ message: 'ElijeSer Backend API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/ping', (req, res) => {
  res.json({ ping: 'pong', timestamp: new Date().toISOString() });
});

// Actualizar la ruta de REGISTRO con más debugging:
app.post('/register', async (req, res) => {
  const { nombre, username, email, password } = req.body;
  let connection;
  
  try {
    console.log('=== REGISTRO DEBUG ===');
    console.log('Datos recibidos:', { nombre, username, email, password: '***' });
    
    if (!nombre || !username || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hasheado exitosamente');

    connection = await pool.getConnection();
    console.log('Conexión a DB obtenida');
    
    const query = "INSERT INTO Usuarios (nombre, username, email, password) VALUES (?, ?, ?, ?)";
    console.log('Query a ejecutar:', query);
    console.log('Parámetros:', [nombre, username, email, 'hashedPassword']);
    
    const [result] = await connection.query(query, [nombre, username, email, hashedPassword]);
    console.log('Resultado de inserción:', result);

    res.status(201).json({ 
      message: "Usuario creado exitosamente", 
      id: result.insertId,
      debug: {
        affectedRows: result.affectedRows,
        insertId: result.insertId
      }
    });
  } catch (error) {
    console.error("=== ERROR EN REGISTRO ===");
    console.error("Error completo:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "El email ya existe" });
    }
    
    // Mostrar el error específico para debug
    res.status(500).json({ 
      error: "Error interno del servidor",
      debug: {
        code: error.code,
        message: error.message
      }
    });
  } finally {
    if (connection) connection.release();
  }
});

// Actualizar la ruta de LOGIN:
app.post('/login', async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    connection = await pool.getConnection();
    const [result] = await connection.query("SELECT * FROM Usuarios WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const user = result[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    // Crear JWT token
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email },
      process.env.JWT_SECRET || 'mi-super-secreto-jwt-2024',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint para obtener usuario por ID
app.get('/usuario/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    console.log('Obteniendo usuario con ID:', id);

    if (!id) {
      return res.status(400).json({ success: false, message: "ID de usuario requerido" });
    }

    connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT id_usuario, nombre, username, email FROM Usuarios WHERE id_usuario = ?", 
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = result[0];
    
    res.json({
      success: true,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  } finally {
    if (connection) connection.release();
  }
});

// Modificar temporalmente health/db para mostrar usuarios:
app.get('/health/db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    
    // Agregar info de usuarios
    const [users] = await connection.query("SELECT id_usuario, nombre, username, email FROM Usuarios");
    
    res.json({ 
      status: 'OK', 
      database: 'Connected', 
      timestamp: new Date().toISOString(),
      total_users: users.length,
      users: users
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({ status: 'Error', error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Endpoint temporal para ver usuarios (SOLO para debugging)
// Corregir el endpoint debug/users quitando created_at:
app.get('/debug/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    // Quitar created_at ya que no existe esa columna
    const [users] = await connection.query("SELECT id_usuario, nombre, username, email FROM Usuarios");
    res.json({ 
      message: "Usuarios en la base de datos",
      count: users.length,
      users: users 
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});