import {Router} from 'express';
import { verifyToken } from "../middlewares/authMiddleware.js";
import { 
    getPacientes, 
    createPacientes, 
    updatePacientes, 
    deletePacientes} from '../controllers/PacienteControllers.js';   

const router = Router();

// Aplicar verifyToken individualmente a cada ruta (no globalmente)
router.get('/pacientes/:id', verifyToken, getPacientes);
router.post('/pacientes', verifyToken, createPacientes);
router.put('/pacientes/:id', verifyToken, updatePacientes);
router.delete('/pacientes/:id', verifyToken, deletePacientes);  

export default router;