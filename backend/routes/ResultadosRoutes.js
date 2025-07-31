import { Router } from "express"
import {crearResultados, obtenerResultadosPorPaciente } from "../controllers/ResultadosController.js"
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router()
router.post('/resultados', verifyToken, crearResultados)
router.get("/resultados/paciente/:id_paciente", verifyToken, obtenerResultadosPorPaciente);

export default router