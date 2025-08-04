import { queryAdapter } from "../db_adapter.js";

export const getConsultas = async (req, res) => {
    try {
        const id_paciente = req.params.id;
        const result = await queryAdapter("SELECT * FROM consultas WHERE id_paciente = $1", [id_paciente]);
        res.json(result);
    } catch (error) {
        console.error("Error al obtener las consultas:", error);
        res.status(500).json({ message: "Error al obtener las consultas" });
    }
};

export const createConsulta = async (req, res) => {
    try {
        const { id_paciente, fecha_consulta, hora, observaciones} = req.body;
        const result = await queryAdapter('INSERT INTO consultas (id_paciente, fecha_consulta, hora, observaciones) VALUES ($1, $2, $3, $4) RETURNING id_consulta', [id_paciente, fecha_consulta, hora, observaciones]);
        
        const id_consulta = result[0].id_consulta;
        
        res.json({
            message: 'Consulta creada',
            body: {
                consulta: { id_consulta: id_consulta, id_paciente, fecha_consulta, hora, observaciones }
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteConsulta = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await queryAdapter('DELETE FROM consultas WHERE id_consulta = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Consulta no encontrada' });
        }
        
        res.json({
            message: 'Consulta eliminada exitosamente',
            id_consulta: id
        });
    } catch (error) {
        console.error("Error al eliminar consulta:", error);
        res.status(500).json({ error: error.message });
    }
};
