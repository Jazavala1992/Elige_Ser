import { queryAdapter } from "../db_adapter.js";

export const createMedicion = async (req, res) => {
    const {id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
    try {
        const [result] = await queryAdapter.query(
            'INSERT INTO mediciones (id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_medicion',
            [id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral]);
        
        // Para PostgreSQL, el ID está en result[0].id_medicion si usamos RETURNING
        // Para MySQL, está en result.insertId
        const id_medicion = result[0]?.id_medicion || result.insertId;
        
        const response = {
            message: 'Medición guardada correctamente',
            body: {
                medicion: { 
                    id_medicion: id_medicion, 
                    id_consulta, 
                    peso, 
                    talla, 
                    pl_tricipital, 
                    pl_bicipital, 
                    pl_subescapular, 
                    pl_supraespinal, 
                    pl_suprailiaco, 
                    pl_abdominal, 
                    pl_muslo_medial, 
                    pl_pantorrilla_medial, 
                    per_brazo_reposo, 
                    per_brazo_flex, 
                    per_muslo_medio, 
                    per_pantorrilla_medial, 
                    per_cintura, 
                    per_cadera, 
                    diametro_femoral, 
                    diametro_biestiloideo, 
                    diametro_humeral 
                }
            }
        };

        console.log("Respuesta del controlador createMedicion:", response);
        res.status(201).json(response);
    } catch (error) {
        console.error("Error al guardar la medición:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

export const getMedicionesByPaciente = async (req, res) => {
    const { id_paciente } = req.params;
    try {
        const [mediciones] = await queryAdapter.query(
            `SELECT m.* 
             FROM mediciones m
             INNER JOIN consultas c ON m.id_consulta = c.id_consulta
             WHERE c.id_paciente = ?`,
            [id_paciente]
        );
        if (mediciones.length === 0) {
            return res.status(404).json({ message: 'No se encontraron mediciones para este paciente' });
        }
        res.status(200).json(mediciones);
    } catch (error) {
        console.error("Error al obtener las mediciones del paciente:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

export const updateMedicion = async (req, res) => {
    const { id } = req.params;
    const {peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
    
    try {
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
        console.error("Error al actualizar medición:", error);
        res.status(500).json({ error: error.message });
    }
}

export const deleteMedicion = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await queryAdapter.query('DELETE FROM mediciones WHERE id_medicion = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medición no encontrada' });
        }
        
        res.json({
            message: 'Medición eliminada exitosamente',
            id_medicion: id
        });
    } catch (error) {
        console.error("Error al eliminar medición:", error);
        res.status(500).json({ error: error.message });
    }
}

