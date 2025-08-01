import { pool } from "../db.js";
import queryAdapter from "../db_adapter.js";

export const getPacientes = async (req, res) => {
    try {
      const id_usuario = req.params.id;
      const [result] = await queryAdapter.query("SELECT * FROM pacientes WHERE id_usuario = ? AND activo = TRUE", [id_usuario]);
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
      const nuevoPaciente = await queryAdapter.query(
        "INSERT INTO pacientes (id_usuario, nombre, fecha_nacimiento, sexo, telefono, ocupacion, nivel_actividad, objetivo, horas_sueno, habitos, antecedentes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
  
      const result = await queryAdapter.query(
        `UPDATE pacientes 
         SET nombre = ?, telefono = ?, ocupacion = ?, nivel_actividad = ?, objetivo = ?, horas_sueno = ?, habitos = ?, antecedentes = ?
         WHERE id_paciente = ?`,
        [nombre, telefono, ocupacion, nivel_actividad, objetivo, horas_sueno, habitos, antecedentes, req.params.id]
      );
  
      if (result.affectedRows === 0) {
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
      const result = await queryAdapter.query(
        `UPDATE pacientes 
         SET activo = FALSE 
         WHERE id_paciente = ?`,
        [req.params.id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
  
      res.json({ message: "Paciente eliminado" });
    } catch (error) {
      console.error("Error al eliminar el paciente:", error);
      res.status(500).json({ error: error.message });
    }
  };