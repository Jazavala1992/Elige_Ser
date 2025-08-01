import { Router } from "express";
import {createMedicion, getMedicionesByPaciente, updateMedicion, deleteMedicion } from "../controllers/MedicionesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = Router();
router.post('/mediciones', verifyToken, createMedicion);
router.get("/mediciones/paciente/:id_paciente", verifyToken, getMedicionesByPaciente);
router.put('/mediciones/:id', verifyToken, updateMedicion);
router.delete('/mediciones/:id', verifyToken, deleteMedicion);

// Rutas temporales sin autenticación para desarrollo
router.put('/mediciones-temp/:id', (req, res) => {
    updateMedicion(req, res);
});

router.delete('/mediciones-temp/:id', (req, res) => {
    deleteMedicion(req, res);
});

export default router;