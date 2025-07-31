import { pool } from "../db.js";

export const getConsultas = async (req, res) => {
    try {
        const id_paciente = req.params.id;
        const [result] = await pool.query("SELECT * FROM Consultas WHERE id_paciente = ? AND activo = TRUE", [id_paciente]);
        res.json(result);
    } catch (error) {
        console.error("Error al obtener las consultas:", error);
        res.status(500).json({ message: "Error al obtener las consultas" });
    }
}

export const createConsulta = async (req, res) => {
    try {
        const { id_paciente, fecha_consulta, Hora, observaciones} = req.body;
        const result = await pool.query('INSERT INTO Consultas (id_paciente, fecha_consulta, Hora, observaciones) VALUES (?, ?, ?, ?)', [id_paciente, fecha_consulta, Hora, observaciones]);
        res.json({
            message: 'Consulta creada',
            body: {
                consulta: { id_paciente: result.insertId, fecha_consulta, Hora, observaciones }
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}