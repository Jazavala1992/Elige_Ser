import { Router } from "express"
import {crearResultados, obtenerResultadosPorPaciente } from "../controllers/ResultadosController.js"

const router = Router()
router.post('/resultados', crearResultados)
router.get("/resultados/paciente/:id_paciente", obtenerResultadosPorPaciente);

export default router