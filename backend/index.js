import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import indexRoutes from './routes/index.routes.js';
import setupRoutes from './routes/setup.routes.js';
import PacientesRoutes from './routes/PacientesRoutes.js';
import UsuariosRoutes from './routes/UsuariosRoutes.js';
import ConsultasRoutes from './routes/ConsultaRoutes.js';
import MedicionesRoutes from './routes/MedicionesRoutes.js';
import ResultadosRoutes from './routes/ResultadosRoutes.js';
import RegistrosRoutes from './routes/RegistrosRoutes.js';

const app = express();

// Configuración CORS para desarrollo y producción
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://elige-ser.netlify.app',
    'https://elige-ser-frontend.onrender.com',
    'https://elige-ser.onrender.com'
  ],
  credentials: true
};

app.use(cors(corsOptions)); // Habilita CORS para el frontend
app.use(express.json()); // Habilita el manejo de JSON en las solicitudes

// Rutas
app.use(indexRoutes);
app.use(setupRoutes);
app.use(UsuariosRoutes); 
app.use(PacientesRoutes);
app.use(ConsultasRoutes);
app.use(MedicionesRoutes);
app.use(ResultadosRoutes);
app.use(RegistrosRoutes);


// Inicia el servidor
app.listen(PORT);
console.log(`Server is running on port ${PORT}`);