import { Router } from "express";
import {createMedicion, getMedicionesByPaciente } from "../controllers/MedicionesController.js";


const router = Router();
router.post('/mediciones', createMedicion);
router.get("/mediciones/paciente/:id_paciente", getMedicionesByPaciente);

export default router;