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

// RUTAS BÁSICAS SIN BASE DE DATOS
app.get('/', (req, res) => {
  res.json({ message: 'ElijeSer Backend API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK - No DB', timestamp: new Date().toISOString() });
});

app.get('/ping', (req, res) => {
  res.json({ ping: 'pong', timestamp: new Date().toISOString() });
});

// RUTA DE REGISTRO TEMPORAL
app.post('/register', (req, res) => {
  const { nombre, username, email, password } = req.body;
  
  res.status(201).json({ 
    message: "Usuario creado exitosamente (temporal)", 
    data: { nombre, username, email } 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});