import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// IMPORTAR TODAS LAS RUTAS
import indexRoutes from './routes/index.routes.js';
import usuariosRoutes from './routes/UsuariosRoutes.js';
import pacientesRoutes from './routes/PacientesRoutes.js';
import consultaRoutes from './routes/ConsultaRoutes.js';
import medicionesRoutes from './routes/MedicionesRoutes.js';
import resultadosRoutes from './routes/ResultadosRoutes.js';
import registrosRoutes from './routes/RegistrosRoutes.js';

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

// USAR TODAS LAS RUTAS
app.use('/', indexRoutes);
app.use('/', usuariosRoutes);
app.use('/', pacientesRoutes);
app.use('/', consultaRoutes);
app.use('/', medicionesRoutes);
app.use('/', resultadosRoutes);
app.use('/', registrosRoutes);

// RUTAS BÁSICAS (mantener estas como backup)
app.get('/', (req, res) => {
  res.json({ message: 'ElijeSer Backend API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// HEALTH DB
app.get('/health/db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
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
    if (connection) connection.release();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});