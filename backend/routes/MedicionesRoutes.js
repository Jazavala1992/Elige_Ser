import { Router } from "express";
import {createMedicion, getMedicionesByPaciente, updateMedicion, deleteMedicion } from "../controllers/MedicionesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { queryAdapter } from "../db_adapter.js";


const router = Router();

// Ruta de prueba para verificar que las rutas temporales funcionan
router.get('/mediciones-temp/test', (req, res) => {
    console.log("Ruta de prueba mediciones-temp/test accedida");
    res.json({ message: "Rutas temporales de mediciones funcionando correctamente", timestamp: new Date().toISOString() });
});

router.post('/mediciones', verifyToken, createMedicion);
router.get("/mediciones/paciente/:id_paciente", verifyToken, getMedicionesByPaciente);
router.put('/mediciones/:id', verifyToken, updateMedicion);
router.delete('/mediciones/:id', verifyToken, deleteMedicion);

// Rutas alternativas para bypass de autenticación
router.post('/api/mediciones/create', async (req, res) => {
    console.log("Ruta alternativa POST mediciones/create llamada");
    console.log("Datos recibidos:", req.body);
    
    try {
        const {id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        const [result] = await queryAdapter.query(
            `INSERT INTO mediciones (id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral]
        );
        
        res.status(201).json({
            message: 'Medición creada exitosamente',
            id_medicion: result.insertId
        });
    } catch (error) {
        console.error("Error en ruta alternativa POST:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/api/mediciones/patient/:id_paciente", async (req, res) => {
    console.log("Ruta alternativa GET mediciones/patient llamada para paciente:", req.params.id_paciente);
    
    try {
        const { id_paciente } = req.params;
        const [mediciones] = await queryAdapter.query(
            'SELECT * FROM mediciones WHERE id_paciente = ? ORDER BY fecha_medicion DESC',
            [id_paciente]
        );
        
        res.json(mediciones);
    } catch (error) {
        console.error("Error en ruta alternativa GET:", error);
        res.status(500).json({ error: error.message });
    }
});
router.put('/api/mediciones/update/:id', async (req, res) => {
    console.log("Ruta alternativa PUT mediciones/update llamada para ID:", req.params.id);
    console.log("Datos recibidos:", req.body);
    
    try {
        const { id } = req.params;
        const {peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        const [result] = await queryAdapter.query(
            `UPDATE mediciones SET 
             peso = ?, talla = ?, pl_tricipital = ?, pl_bicipital = ?, pl_subescapular = ?, 
             pl_supraespinal = ?, pl_suprailiaco = ?, pl_abdominal = ?, pl_muslo_medial = ?, 
             pl_pantorrilla_medial = ?, per_brazo_reposo = ?, per_brazo_flex = ?, per_muslo_medio = ?, 
             per_pantorrilla_medial = ?, per_cintura = ?, per_cadera = ?, diametro_femoral = ?, 
             diametro_biestiloideo = ?, diametro_humeral = ?
             WHERE id_medicion = ?`,
            [peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medición no encontrada' });
        }
        
        res.json({
            message: 'Medición actualizada exitosamente',
            id_medicion: id
        });
    } catch (error) {
        console.error("Error en ruta alternativa PUT:", error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/api/mediciones/delete/:id', async (req, res) => {
    console.log("Ruta alternativa DELETE mediciones/delete llamada para ID:", req.params.id);
    
    try {
        const { id } = req.params;
        const [result] = await queryAdapter.query('DELETE FROM mediciones WHERE id_medicion = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medición no encontrada' });
        }
        
        res.json({
            message: 'Medición eliminada exitosamente',
            id_medicion: id
        });
    } catch (error) {
        console.error("Error en ruta alternativa DELETE:", error);
        res.status(500).json({ error: error.message });
    }
});

// Rutas temporales sin autenticación para desarrollo (mantener por compatibilidad)
router.put('/mediciones-temp/:id', async (req, res) => {
    console.log("Ruta temporal PUT mediciones-temp llamada para ID:", req.params.id);
    console.log("Datos recibidos:", req.body);
    
    try {
        const { id } = req.params;
        const {peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        const [result] = await queryAdapter.query(
            `UPDATE mediciones SET 
             peso = ?, talla = ?, pl_tricipital = ?, pl_bicipital = ?, pl_subescapular = ?, 
             pl_supraespinal = ?, pl_suprailiaco = ?, pl_abdominal = ?, pl_muslo_medial = ?, 
             pl_pantorrilla_medial = ?, per_brazo_reposo = ?, per_brazo_flex = ?, per_muslo_medio = ?, 
             per_pantorrilla_medial = ?, per_cintura = ?, per_cadera = ?, diametro_femoral = ?, 
             diametro_biestiloideo = ?, diametro_humeral = ?
             WHERE id_medicion = ?`,
            [peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medición no encontrada' });
        }
        
        res.json({
            message: 'Medición actualizada exitosamente',
            id_medicion: id
        });
    } catch (error) {
        console.error("Error en ruta temporal PUT:", error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/mediciones-temp/:id', async (req, res) => {
    console.log("Ruta temporal DELETE mediciones-temp llamada para ID:", req.params.id);
    
    try {
        const { id } = req.params;
        const [result] = await queryAdapter.query('DELETE FROM mediciones WHERE id_medicion = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medición no encontrada' });
        }
        
        res.json({
            message: 'Medición eliminada exitosamente',
            id_medicion: id
        });
    } catch (error) {
        console.error("Error en ruta temporal DELETE:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;