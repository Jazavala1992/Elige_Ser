import { queryAdapter } from "../db_adapter.js";

export const crearResultados = async (req, res) => {
    const {id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual} = req.body;
    try {
        const [result] = await queryAdapter.query(
            'INSERT INTO resultados (id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_resultado',
            [id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual]
        );
        
        // Para PostgreSQL, el ID está en result[0].id_resultado si usamos RETURNING
        // Para MySQL, está en result.insertId
        const id_resultado = result[0]?.id_resultado || result.insertId;
        
        res.status(201).json({
            message: 'Resultados guardados correctamente',
            body: {
                resultado: { id_resultado: id_resultado, id_medicion, imc, suma_pliegues, porcentaje_grasa, masa_muscular_kg, porcentaje_masa_muscular, masa_osea, masa_residual }
            }
        });
        
        console.log("Resultados guardados exitosamente con ID:", id_resultado);
    } catch (error) {
        console.error("Error al guardar resultados:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

export const obtenerResultadosPorPaciente = async (req, res) => {
    const { id_paciente } = req.params;
    console.log("Buscando resultados para paciente ID:", id_paciente);
    
    try {
        const [resultados] = await queryAdapter.query(
            `SELECT r.* 
             FROM resultados r
                INNER JOIN mediciones m ON m.id_medicion = r.id_medicion
                INNER JOIN consultas c ON m.id_consulta = c.id_consulta
                INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
            WHERE p.id_paciente = ?`,
            [id_paciente]
        );
        
        console.log("Resultados encontrados:", resultados.length);
        
        // Siempre devolver un array, incluso si está vacío
        // Esto evita errores 404 en el frontend
        res.status(200).json(resultados || []);
    } catch (error) {
        console.error("Error al obtener resultados del paciente:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}
