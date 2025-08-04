import { queryAdapter } from "../db_adapter.js";

export const getPacientes = async (req, res) => {
    try {
      const id_usuario = req.params.id;
      const result = await queryAdapter("SELECT * FROM pacientes WHERE id_usuario = $1", [id_usuario]);
      res.json(result); 
    } catch (error) {
      console.error("Error al obtener los pacientes:", error);
      res.status(500).json({ message: "Error al obtener los pacientes" });
    }
};


export const createPacientes = async (req, res) => {
    try {
      const {
        id_usuario,
        nombre,
        fecha_nacimiento,
        sexo,
        telefono,
        ocupacion,
        nivel_actividad,
        objetivo,
        horas_sueno,
        habitos,
        antecedentes,
      } = req.body;
  
      // Verificar que todos los campos requeridos estén presentes
      if (
        !id_usuario ||
        !nombre ||
        !fecha_nacimiento ||
        !sexo ||
        !telefono ||
        !ocupacion ||
        !nivel_actividad ||
        !objetivo ||
        !horas_sueno ||
        !habitos ||
        !antecedentes
      ) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }
  
      // Guardar el paciente en la base de datos
      const nuevoPaciente = await queryAdapter(
        "INSERT INTO pacientes (id_usuario, nombre, fecha_nacimiento, sexo, telefono, ocupacion, nivel_actividad, objetivo, horas_sueno, habitos, antecedentes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
        [
          id_usuario,
          nombre,
          fecha_nacimiento,
          sexo,
          telefono,
          ocupacion,
          nivel_actividad,
          objetivo,
          horas_sueno,
          habitos,
          antecedentes,
        ]
      );
  
      res.status(201).json({ message: "Paciente creado exitosamente", paciente: nuevoPaciente });
    } catch (error) {
      console.error("Error al crear paciente:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  export const updatePacientes = async (req, res) => {
    try {
      const {
        nombre,
        telefono,
        ocupacion,
        nivel_actividad,
        objetivo,
        horas_sueno,
        habitos,
        antecedentes,
      } = req.body;
  
      const result = await queryAdapter(
        `UPDATE pacientes 
         SET nombre = $1, telefono = $2, ocupacion = $3, nivel_actividad = $4, objetivo = $5, horas_sueno = $6, habitos = $7, antecedentes = $8
         WHERE id_paciente = $9`,
        [nombre, telefono, ocupacion, nivel_actividad, objetivo, horas_sueno, habitos, antecedentes, req.params.id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
  
      res.json({ message: "Paciente actualizado" });
    } catch (error) {
      console.error("Error al actualizar el paciente:", error);
      res.status(500).json({ error: error.message });
    }
  };

  export const deletePacientes = async (req, res) => {
    try {
      const result = await queryAdapter(
        `DELETE FROM pacientes WHERE id_paciente = $1`,
        [req.params.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      res.json({ message: "Paciente eliminado" });
    } catch (error) {
      console.error("Error al eliminar el paciente:", error);
      res.status(500).json({ error: error.message });
    }
  };
