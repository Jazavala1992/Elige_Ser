import React, { createContext, useContext, useState } from "react";
import { crearMedicionesRequest, obtenerMedicionesPorPacienteRequest } from '../api/api';

const MedicionesContext = createContext();

export const MedicionesProvider = ({ children }) => {
  const [medicion, setMediciones] = useState([]);

  const crearMediciones = async (mediciones) => {
    try {
      const response = await crearMedicionesRequest(mediciones);
      console.log("Respuesta válida del backend:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al crear mediciones:", error);
      throw error;
    }
  };

  const obtenerMedicionesPorPaciente = async (id) => {
    try {
      const response = await obtenerMedicionesPorPacienteRequest(id);
      const mediciones = response?.data || response; // Ajusta según la estructura de la respuesta
      console.log("Mediciones obtenidas del backend:", mediciones);
      setMediciones(mediciones || []);
      return mediciones || [];
    } catch (error) {
      console.error("Error al obtener mediciones por paciente:", error);
      throw error;
    }
  };

  return (
    <MedicionesContext.Provider value={{ medicion, setMediciones, crearMediciones, obtenerMedicionesPorPaciente }}>
      {children}
    </MedicionesContext.Provider>
  );

};


export const useMediciones = () => useContext(MedicionesContext);