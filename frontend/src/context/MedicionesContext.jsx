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
      
      // Asegurar que siempre devolvemos un array
      const medicionesArray = Array.isArray(mediciones) ? mediciones : [];
      setMediciones(medicionesArray);
      return medicionesArray;
    } catch (error) {
      console.error("Error al obtener mediciones por paciente:", error);
      // En caso de error 404 o cualquier otro, devolver array vacío
      setMediciones([]);
      return [];
    }
  };

  return (
    <MedicionesContext.Provider value={{ medicion, setMediciones, crearMediciones, obtenerMedicionesPorPaciente }}>
      {children}
    </MedicionesContext.Provider>
  );

};


export const useMediciones = () => useContext(MedicionesContext);