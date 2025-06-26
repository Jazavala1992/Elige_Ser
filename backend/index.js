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

// RUTA DE REGISTRO CON BASE DE DATOS
app.post('/register', async (req, res) => {
  const { nombre, username, email, password } = req.body;
  
  try {
    if (!nombre || !username || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = "INSERT INTO Usuarios (nombre, username, email, password) VALUES (?, ?, ?, ?)";
    const [result] = await pool.query(query, [nombre, username, email, hashedPassword]);

    res.status(201).json({ message: "Usuario creado exitosamente", id: result.insertId });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "El email ya existe" });
    }
    
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// RUTA DE LOGIN
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    const [result] = await pool.query("SELECT * FROM Usuarios WHERE email = ?", [email]);

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
  }
});

// Nueva ruta para verificar la conexión a la base de datos
app.get('/health/db', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    res.json({ status: 'OK', database: 'Connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'Error', error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});