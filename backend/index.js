import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { pool } from './db.js';

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

// RUTAS BÁSICAS PRIMERO
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

// IMPORTAR RUTAS UNA POR UNA PARA IDENTIFICAR EL PROBLEMA
try {
  console.log('Importando UsuariosRoutes...');
  const UsuariosRoutes = await import('./routes/UsuariosRoutes.js');
  app.use(UsuariosRoutes.default);
  console.log('✅ UsuariosRoutes importado exitosamente');
} catch (error) {
  console.error('❌ Error importando UsuariosRoutes:', error);
}

// Comentar las demás rutas temporalmente
/*
try {
  const indexRoutes = await import('./routes/index.routes.js');
  app.use(indexRoutes.default);
} catch (error) {
  console.error('❌ Error importando index.routes:', error);
}
*/

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});