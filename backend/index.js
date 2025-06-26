import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import indexRoutes from './routes/index.routes.js';
import PacientesRoutes from './routes/PacientesRoutes.js';
import UsuariosRoutes from './routes/UsuariosRoutes.js';
import ConsultasRoutes from './routes/ConsultaRoutes.js';
import MedicionesRoutes from './routes/MedicionesRoutes.js';
import ResultadosRoutes from './routes/ResultadosRoutes.js';
import RegistrosRoutes from './routes/RegistrosRoutes.js';
import { pool } from './db.js';

const app = express();

// CORS configurado para desarrollo y producción
const corsOptions = {
  origin: [
    'https://elige-ser.onrender.com', // Tu frontend en producción
    'http://localhost:5173',         // Desarrollo local
    'http://localhost:3000',         // Desarrollo local alternativo
    'http://localhost:4000'          // Backend local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// RUTAS PÚBLICAS PRIMERO (antes de cualquier middleware de auth)
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

// RUTAS PROTEGIDAS (después de las rutas públicas)
app.use(indexRoutes);
app.use(UsuariosRoutes); 
app.use(PacientesRoutes);
app.use(ConsultasRoutes);
app.use(MedicionesRoutes);
app.use(ResultadosRoutes);
app.use(RegistrosRoutes);

// Inicia el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});