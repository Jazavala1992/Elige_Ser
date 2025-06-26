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

// IMPORTAR RUTAS UNA POR UNA PARA DETECTAR EL PROBLEMA
console.log('Importando indexRoutes...');
import indexRoutes from './routes/index.routes.js';
app.use(indexRoutes);
console.log('✅ indexRoutes importado');

console.log('Importando UsuariosRoutes...');
import UsuariosRoutes from './routes/UsuariosRoutes.js';
app.use(UsuariosRoutes);
console.log('✅ UsuariosRoutes importado');

// Comentar las demás rutas temporalmente para probar
/*
console.log('Importando PacientesRoutes...');
import PacientesRoutes from './routes/PacientesRoutes.js';
app.use(PacientesRoutes);
console.log('✅ PacientesRoutes importado');

console.log('Importando ConsultasRoutes...');
import ConsultasRoutes from './routes/ConsultaRoutes.js';
app.use(ConsultasRoutes);
console.log('✅ ConsultasRoutes importado');

console.log('Importando MedicionesRoutes...');
import MedicionesRoutes from './routes/MedicionesRoutes.js';
app.use(MedicionesRoutes);
console.log('✅ MedicionesRoutes importado');

console.log('Importando ResultadosRoutes...');
import ResultadosRoutes from './routes/ResultadosRoutes.js';
app.use(ResultadosRoutes);
console.log('✅ ResultadosRoutes importado');

console.log('Importando RegistrosRoutes...');
import RegistrosRoutes from './routes/RegistrosRoutes.js';
app.use(RegistrosRoutes);
console.log('✅ RegistrosRoutes importado');
*/

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});