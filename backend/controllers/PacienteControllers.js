import { PacienteService } from "../services/PacienteService.js";

export const getPacientes = async (req, res) => {
    try {
      const id_usuario = req.params.id;
      const result = await PacienteService.obtenerPacientesPorUsuario(id_usuario);
      res.json(result); 
    } catch (error) {
      console.error("Error al obtener los pacientes:", error);
      
      if (error.code === 'NOT_FOUND') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error interno del servidor" });
    }
};


export const createPacientes = async (req, res) => {
    try {
      const datosCompletos = req.body;
      
      const result = await PacienteService.crearPaciente(datosCompletos);
      
      res.status(201).json({
        success: true,
        message: "Paciente creado exitosamente",
        paciente: result
      });
    } catch (error) {
      console.error("Error al crear el paciente:", error);
      
      if (error.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const updatePacientes = async (req, res) => {
    try {
      const result = await PacienteService.actualizarPaciente(req.params.id, req.body);
      
      res.json({
        success: true,
        message: "Paciente actualizado exitosamente",
        paciente: result
      });
    } catch (error) {
      console.error("Error al actualizar el paciente:", error);
      
      if (error.code === 'NOT_FOUND') {
        return res.status(404).json({ message: error.message });
      }
      if (error.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const deletePacientes = async (req, res) => {
    try {
      const result = await PacienteService.eliminarPaciente(req.params.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error("Error al eliminar el paciente:", error);
      
      if (error.code === 'NOT_FOUND') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error interno del servidor" });
    }
};