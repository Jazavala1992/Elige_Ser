import { queryAdapter } from "../db_adapter.js";

export const createMedicion = async (req, res) => {
    const {id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral} = req.body;
    try {
        const [result] = await queryAdapter.query(
            'INSERT INTO mediciones (id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id_consulta, peso, talla, pl_tricipital, pl_bicipital, pl_subescapular, pl_supraespinal, pl_suprailiaco, pl_abdominal, pl_muslo_medial, pl_pantorrilla_medial, per_brazo_reposo, per_brazo_flex, per_muslo_medio, per_pantorrilla_medial, per_cintura, per_cadera, diametro_femoral, diametro_biestiloideo, diametro_humeral]);
        
        const response = {
            message: 'Medición guardada correctamente',
            body: {
                medicion: { 
                    id_medicion: result.insertId, 
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

