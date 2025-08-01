import {Router} from 'express';
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getConsultas, createConsulta, deleteConsulta } from '../controllers/ConsultaController.js';

const router = Router();
router.use(verifyToken);

router.get('/consultas/:id', getConsultas);
router.post('/consultas', createConsulta);
router.delete('/consultas/:id', deleteConsulta);
export default router;