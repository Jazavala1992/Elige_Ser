import React, { createContext, useContext, useState } from "react";
import { crearPacienteRequest, editPacienteRequest, eliminarPacienteRequest } from "../api/api";

const PacientesContext = createContext();

export const usePacientes = () => useContext(PacientesContext);

export const PacientesProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);

  const crearPaciente = async (paciente) => {
    try {
      const response = await crearPacienteRequest(paciente);
      return response.data;
    } catch (error) {
      console.error("Error al crear paciente:", error);
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


  return (
    <PacientesContext.Provider value={{ pacientes, setPacientes, crearPaciente, editPaciente, eliminarPaciente }}>
      {children}
    </PacientesContext.Provider>
  );
};