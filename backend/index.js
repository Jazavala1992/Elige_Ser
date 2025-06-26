import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { pool } from './db.js';

// SOLO IMPORTAR indexRoutes PRIMERO
import indexRoutes from './routes/index.routes.js';

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

// RUTAS BÁSICAS
app.get('/', (req, res) => {
  res.json({ message: 'ElijeSer Backend API is running!' });
});

app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    res.json({ status: 'OK', database: 'Connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'Error', error: error.message });
  }
});

// RUTA DE REGISTRO TEMPORAL
app.post('/register', async (req, res) => {
  const { nombre, username, email, password } = req.body;
  
  try {
    res.status(201).json({ 
      message: "Usuario creado exitosamente (temporal)", 
      data: { nombre, username, email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SOLO USAR indexRoutes
app.use(indexRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});