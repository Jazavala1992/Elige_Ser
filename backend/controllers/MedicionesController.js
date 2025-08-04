import { queryAdapter } from "../db_adapter.js";

export const createMedicion = async (req, res) => {
    const {id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
    try {
        const [result] = await queryAdapter.query(
            'INSERT INTO mediciones (id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING id_medicion',
            [id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral]);
        
        // PostgreSQL devuelve el ID en result[0].id_medicion con RETURNING
        const id_medicion = result[0].id_medicion;
        
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
             WHERE c.id_paciente = $1`,
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
             peso = $1, talla = $2, pl_tricipital = $3, pl_bicipital = $4, pl_subescapular = $5, 
             pl_supraespinal = $1, pl_suprailiaco = $2, pl_abdominal = $3, pl_muslo_medial = $4, 
             pl_pantorrilla_medial = $1, per_brazo_reposo = $2, per_brazo_flex = $3, per_muslo_medio = $4, 
             per_pantorrilla_medial = $1, per_cintura = $2, per_cadera = $3, diametro_femoral = $4, 
             diametro_biestiloideo = $1, diametro_humeral = $2
             WHERE id_medicion = $1`,
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
        const [result] = await queryAdapter.query('DELETE FROM mediciones WHERE id_medicion = $1', [id]);
        
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

