import { Router } from "express"
import {crearResultados, obtenerResultadosPorPaciente } from "../controllers/ResultadosController.js"
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router()

// Ruta de prueba simple sin autenticación
router.get("/test-resultados", (req, res) => {
    res.json({ message: "Test route working without authentication" });
});

// Rutas con autenticación
router.post('/resultados', verifyToken, crearResultados)
router.get("/resultados/paciente/:id_paciente", verifyToken, obtenerResultadosPorPaciente);

// Rutas alternativas para bypass de autenticación
router.post('/api/resultados/create', (req, res) => {
    console.log("Ruta alternativa POST resultados/create llamada sin auth");
    crearResultados(req, res);
});

router.get("/api/resultados/patient/:id_paciente", (req, res) => {
    console.log("Ruta alternativa GET resultados/patient llamada sin auth para paciente:", req.params.id_paciente);
    obtenerResultadosPorPaciente(req, res);
});

// Rutas temporales sin autenticación para desarrollo
router.post('/resultados-temp', (req, res) => {
    console.log("Route temp POST called without auth");
    crearResultados(req, res);
});

router.get("/resultados-temp/paciente/:id_paciente", (req, res) => {
    console.log("Route temp GET called without auth for patient:", req.params.id_paciente);
    obtenerResultadosPorPaciente(req, res);
});

export default router;
