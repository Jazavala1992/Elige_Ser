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
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://elige-ser.onrender.com'] // Tu URL del frontend
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // Habilita el manejo de JSON en las solicitudes

// Rutas
app.use(indexRoutes);
app.use(UsuariosRoutes); 
app.use(PacientesRoutes);
app.use(ConsultasRoutes);
app.use(MedicionesRoutes);
app.use(ResultadosRoutes);
app.use(RegistrosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'ElijeSer Backend API is running!' });
});

// Ruta para probar la conexión a la base de datos
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    res.json({ status: 'OK', database: 'Connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'Error', error: error.message });
  }
});

// Inicia el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});