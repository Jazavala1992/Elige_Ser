import {Router} from 'express';
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getConsultas, createConsulta } from '../controllers/ConsultaController.js';

const router = Router();
router.use(verifyToken);

router.get('/consultas/:id', getConsultas);
router.post('/consultas', createConsulta);
export default router;