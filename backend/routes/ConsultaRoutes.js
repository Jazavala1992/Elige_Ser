import {Router} from 'express';
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getConsultas, createConsulta, deleteConsulta } from '../controllers/ConsultaController.js';

const router = Router();

router.get('/consultas/:id', verifyToken, getConsultas);
router.post('/consultas', verifyToken, createConsulta);
router.delete('/consultas/:id', verifyToken, deleteConsulta);
export default router;