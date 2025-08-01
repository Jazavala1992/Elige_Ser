import React, { createContext, useContext, useState } from "react";
import { crearPacienteRequest, editPacienteRequest, eliminarPacienteRequest, obtenerPacientePorIdRequest } from "../api/api";

const PacientesContext = createContext();

export const usePacientes = () => useContext(PacientesContext);

export const PacientesProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);

  const crearPaciente = async (paciente) => {
    try {
      console.log("Datos del paciente antes de enviar:", paciente);
      const response = await crearPacienteRequest(paciente);
      console.log("Respuesta exitosa del servidor:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error completo al crear paciente:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      throw error;
    }
  }

  const editPaciente = async (id, paciente) => {
    try {
      const response = await editPacienteRequest(id, paciente);
      setPacientes((prevPacientes) =>
        prevPacientes.map((paciente) =>
          paciente.id === id ? response.data : paciente
        )
      );
    } catch (error) {
      console.error("Error al editar paciente:", error);
    }
  };

  const eliminarPaciente = async (id) => {
    try {
      await eliminarPacienteRequest(id);
      setPacientes((prevPacientes) =>
        prevPacientes.filter((paciente) => paciente.id !== id)
      );
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
    }
  }

  const obtenerPacientePorId = async (idPaciente) => {
    try {
      console.log("🔍 PacientesContext: Obteniendo paciente con ID:", idPaciente);
      const response = await obtenerPacientePorIdRequest(idPaciente);
      console.log("📦 PacientesContext: Respuesta completa del backend:", response);
      console.log("👤 PacientesContext: Datos del paciente:", response.data);
      console.log("🎯 PacientesContext: Paciente extraído:", response.data.paciente);
      
      if (response.data && response.data.paciente) {
        return response.data.paciente;
      } else {
        console.warn("⚠️ PacientesContext: Formato de respuesta inesperado");
        return null;
      }
    } catch (error) {
      console.error("❌ PacientesContext: Error al obtener paciente por ID:", error);
      throw error;
    }
  };


  return (
    <PacientesContext.Provider value={{ pacientes, setPacientes, crearPaciente, editPaciente, eliminarPaciente, obtenerPacientePorId }}>
      {children}
    </PacientesContext.Provider>
  );
};