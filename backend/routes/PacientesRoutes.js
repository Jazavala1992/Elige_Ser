import {Router} from 'express';
import { verifyToken } from "../middlewares/authMiddleware.js";
import { 
    getPacientes, 
    createPacientes, 
    updatePacientes, 
    deletePacientes} from '../controllers/PacienteControllers.js';   

const router = Router();
router.use(verifyToken);

router.get('/pacientes/:id', getPacientes);
router.post('/pacientes',verifyToken, createPacientes);
router.put('/pacientes/:id', updatePacientes);
router.put('/pacientes/:id', deletePacientes);

export default router;