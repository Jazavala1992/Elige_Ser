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
    console.log("=== CREAR CONSULTA ===");
    console.log("Headers:", req.headers);
    console.log("Body recibido:", req.body);
    console.log("User ID desde token:", req.userId);
    
    try {
        const { id_paciente, fecha_consulta, hora, observaciones} = req.body;
        
        console.log("Datos extraídos:");
        console.log("- id_paciente:", id_paciente, "(tipo:", typeof id_paciente, ")");
        console.log("- fecha_consulta:", fecha_consulta, "(tipo:", typeof fecha_consulta, ")");
        console.log("- hora:", hora, "(tipo:", typeof hora, ")");
        console.log("- observaciones:", observaciones, "(tipo:", typeof observaciones, ")");
        
        // Validaciones básicas
        if (!id_paciente) {
            console.log("❌ Error: id_paciente es requerido");
            return res.status(400).json({ message: 'id_paciente es requerido', error: 'MISSING_ID_PACIENTE' });
        }
        
        if (!fecha_consulta) {
            console.log("❌ Error: fecha_consulta es requerida");
            return res.status(400).json({ message: 'fecha_consulta es requerida', error: 'MISSING_FECHA_CONSULTA' });
        }
        
        if (!hora) {
            console.log("❌ Error: hora es requerida");
            return res.status(400).json({ message: 'hora es requerida', error: 'MISSING_HORA' });
        }
        
        const result = await queryAdapter('INSERT INTO consultas (id_paciente, fecha_consulta, hora, observaciones) VALUES ($1, $2, $3, $4) RETURNING id_consulta', [id_paciente, fecha_consulta, hora, observaciones]);
        
        const id_consulta = result[0].id_consulta;
        
        const responseData = {
            message: 'Consulta creada',
            body: {
                consulta: { id_consulta: id_consulta, id_paciente, fecha_consulta, hora, observaciones }
            }
        };
        
        console.log("✅ Consulta creada exitosamente con ID:", id_consulta);
        res.status(201).json(responseData);
    } catch (error) {
        console.error("❌ Error al crear consulta:", error);
        console.error("Error details:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ error: error.message });
    }
};

export const updateConsulta = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_consulta, hora, observaciones } = req.body;
        
        const result = await queryAdapter(
            'UPDATE consultas SET fecha_consulta = $1, hora = $2, observaciones = $3 WHERE id_consulta = $4',
            [fecha_consulta, hora, observaciones, id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Consulta no encontrada' });
        }
        
        res.json({
            message: 'Consulta actualizada exitosamente',
            body: {
                consulta: { id_consulta: id, fecha_consulta, hora, observaciones }
            }
        });
    } catch (error) {
        console.error("Error al actualizar consulta:", error);
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
