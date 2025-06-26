import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';

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

// RUTAS BÁSICAS SOLAMENTE
app.get('/', (req, res) => {
  res.json({ message: 'ElijeSer Backend API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// RUTA DE REGISTRO MANUAL (sin archivos externos por ahora)
app.post('/register', async (req, res) => {
  res.json({ message: "Servidor funcionando - registro temporal" });
});

// SIN IMPORTAR NINGUNA RUTA EXTERNA POR AHORA

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});