import { pool } from "../db.js";

export const crearResultados = async (req, res) => {
    const {id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual} = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO ResultadosAntropometricos (id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual]
        );
        res.status(201).json({
            message: 'Resultados guardados correctamente',
            body: {
                resultado: { id_resultado: result.insertId, id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual }
            }
        });
    } catch (error) {
        console.error("Error al guardar resultados:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

export const obtenerResultadosPorPaciente = async (req, res) => {
    const { id_paciente } = req.params;
    try {
        const [resultados] = await pool.query(
            `SELECT r.* 
             FROM ResultadosAntropometricos  r
                INNER JOIN Mediciones m ON m.id_medicion = r.id_medicion
                INNER JOIN Consultas c ON m.id_consulta = c.id_consulta
                INNER JOIN Pacientes p ON c.id_paciente = p.id_paciente
            WHERE p.id_paciente = ? AND r.activo = TRUE`,
            [id_paciente]
        );
        if (resultados.length === 0) {
            return res.status(404).json({ message: 'No se encontraron resultados para este paciente' });
        }
        res.status(200).json(resultados);
    } catch (error) {
        console.error("Error al obtener resultados del paciente:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}
