import {Router} from 'express';
import { registrarLog } from '../controllers/RegistroController.js';  
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post('/api/logs', verifyToken, registrarLog);

export default router;
