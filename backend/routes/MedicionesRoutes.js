import { Router } from "express";
import {createMedicion, getMedicionesByPaciente } from "../controllers/MedicionesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = Router();
router.post('/mediciones', verifyToken, createMedicion);
router.get("/mediciones/paciente/:id_paciente", verifyToken, getMedicionesByPaciente);

export default router;