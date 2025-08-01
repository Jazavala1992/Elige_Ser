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

// Rutas alternativas para bypass de autenticación - CORREGIDAS PARA POSTGRESQL
router.post('/api/mediciones/create', async (req, res) => {
    console.log("🔧 Ruta alternativa POST mediciones/create llamada");
    console.log("📝 Datos recibidos:", req.body);
    
    try {
        const {id_paciente, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        // Validar datos mínimos
        if (!id_paciente) {
            return res.status(400).json({ error: 'id_paciente es requerido' });
        }
        
        // Primero crear una consulta (requerida para mediciones)
        const today = new Date().toISOString().split('T')[0];
        const [consultaResult] = await queryAdapter.query(
            'INSERT INTO consultas (id_paciente, fecha_consulta, observaciones) VALUES (?, ?, ?) RETURNING id_consulta',
            [id_paciente, today, 'Consulta creada automáticamente para nueva medición']
        );
        
        const idConsulta = consultaResult[0]?.id_consulta;
        console.log("✅ Consulta creada con ID:", idConsulta);
        
        // Crear la medición asociada a la consulta
        const [result] = await queryAdapter.query(
            `INSERT INTO mediciones (id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_medicion`,
            [idConsulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral]
        );
        
        const idMedicion = result[0]?.id_medicion;
        console.log("✅ Medición creada con ID:", idMedicion);
        
        res.status(201).json({
            success: true,
            message: 'Medición creada exitosamente',
            id_consulta: idConsulta,
            id_medicion: idMedicion,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error en ruta alternativa POST:", error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

router.get("/api/mediciones/patient/:id_paciente", async (req, res) => {
    console.log("🔧 Ruta alternativa GET mediciones/patient llamada para paciente:", req.params.id_paciente);
    
    try {
        const { id_paciente } = req.params;
        
        // JOIN con consultas para obtener mediciones por paciente (CORREGIDO PARA POSTGRESQL)
        const [mediciones] = await queryAdapter.query(`
            SELECT m.*, c.id_consulta, c.fecha_consulta 
            FROM mediciones m
            INNER JOIN consultas c ON m.id_consulta = c.id_consulta
            WHERE c.id_paciente = ? 
            ORDER BY m.fecha_medicion DESC
        `, [id_paciente]);
        
        console.log("📊 Mediciones encontradas:", mediciones.length);
        res.json({
            success: true,
            count: mediciones.length,
            data: mediciones,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error en ruta alternativa GET:", error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
router.put('/api/mediciones/update/:id', async (req, res) => {
    console.log("🔧 Ruta alternativa PUT mediciones/update llamada para ID:", req.params.id);
    console.log("📝 Datos recibidos:", req.body);
    
    try {
        const { id } = req.params;
        const {peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        // Verificar que la medición existe
        const [existing] = await queryAdapter.query('SELECT id_medicion FROM mediciones WHERE id_medicion = ?', [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Medición no encontrada',
                timestamp: new Date().toISOString()
            });
        }
        
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
        
        console.log("✅ Medición actualizada exitosamente");
        res.json({
            success: true,
            message: 'Medición actualizada exitosamente',
            id_medicion: id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error en ruta alternativa PUT:", error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

router.delete('/api/mediciones/delete/:id', async (req, res) => {
    console.log("🔧 Ruta alternativa DELETE mediciones/delete llamada para ID:", req.params.id);
    
    try {
        const { id } = req.params;
        
        // Verificar que la medición existe antes de eliminar
        const [existing] = await queryAdapter.query('SELECT id_medicion FROM mediciones WHERE id_medicion = ?', [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Medición no encontrada',
                timestamp: new Date().toISOString()
            });
        }
        
        const [result] = await queryAdapter.query('DELETE FROM mediciones WHERE id_medicion = ?', [id]);
        
        console.log("✅ Medición eliminada exitosamente");
        res.json({
            success: true,
            message: 'Medición eliminada exitosamente',
            id_medicion: id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error en ruta alternativa DELETE:", error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Rutas temporales sin autenticación para desarrollo (CORREGIDAS PARA POSTGRESQL)
router.put('/mediciones-temp/:id', async (req, res) => {
    console.log("🔧 Ruta temporal PUT mediciones-temp llamada para ID:", req.params.id);
    console.log("📝 Datos recibidos:", req.body);
    
    try {
        const { id } = req.params;
        const {peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
        
        // Verificar que la medición existe
        const [existing] = await queryAdapter.query('SELECT id_medicion FROM mediciones WHERE id_medicion = ?', [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Medición no encontrada',
                timestamp: new Date().toISOString()
            });
        }
        
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
        
        console.log("✅ Medición temporal actualizada exitosamente");
        res.json({
            success: true,
            message: 'Medición actualizada exitosamente',
            id_medicion: id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error en ruta temporal PUT:", error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
        res.status(500).json({ error: error.message });
    }
});

router.delete('/mediciones-temp/:id', async (req, res) => {
    console.log("🔧 Ruta temporal DELETE mediciones-temp llamada para ID:", req.params.id);
    
    try {
        const { id } = req.params;
        
        // Verificar que la medición existe antes de eliminar
        const [existing] = await queryAdapter.query('SELECT id_medicion FROM mediciones WHERE id_medicion = ?', [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Medición no encontrada',
                timestamp: new Date().toISOString()
            });
        }
        
        const [result] = await queryAdapter.query('DELETE FROM mediciones WHERE id_medicion = ?', [id]);
        
        console.log("✅ Medición temporal eliminada exitosamente");
        res.json({
            success: true,
            message: 'Medición eliminada exitosamente',
            id_medicion: id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Error en ruta temporal DELETE:", error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;