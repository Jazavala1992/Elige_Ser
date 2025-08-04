import {Router} from 'express';
import { verifyToken } from "../middlewares/authMiddleware.js";
import { validateConsultaCreation, validateConsultaUpdate, handleValidationErrors } from "../middlewares/validationMiddleware.js";
import { getConsultas, createConsulta, updateConsulta, deleteConsulta } from '../controllers/ConsultaController.js';

const router = Router();

router.get('/consultas/:id', verifyToken, getConsultas);
router.post('/consultas', verifyToken, validateConsultaCreation, handleValidationErrors, createConsulta);
router.put('/consultas/:id', verifyToken, validateConsultaUpdate, handleValidationErrors, updateConsulta);
router.delete('/consultas/:id', verifyToken, deleteConsulta);

export default router;
