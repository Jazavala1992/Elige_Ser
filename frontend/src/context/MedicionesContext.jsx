import React, { createContext, useContext, useState } from "react";
import { crearMedicionesRequest, obtenerMedicionesPorPacienteRequest, actualizarMedicionRequest, eliminarMedicionRequest } from '../api/api';

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

  const actualizarMedicion = async (id, medicionData) => {
    try {
      const response = await actualizarMedicionRequest(id, medicionData);
      console.log("Medición actualizada:", response.data);
      
      // Actualizar el estado local
      setMediciones(prevMediciones => 
        prevMediciones.map(medicion => 
          medicion.id_medicion === parseInt(id) ? { ...medicion, ...medicionData } : medicion
        )
      );
      
      return response.data;
    } catch (error) {
      console.error("Error al actualizar medición:", error);
      throw error;
    }
  };

  const eliminarMedicion = async (id) => {
    try {
      const response = await eliminarMedicionRequest(id);
      console.log("Medición eliminada:", response.data);
      
      // Actualizar el estado local removiendo la medición eliminada
      setMediciones(prevMediciones => 
        prevMediciones.filter(medicion => medicion.id_medicion !== parseInt(id))
      );
      
      return response.data;
    } catch (error) {
      console.error("Error al eliminar medición:", error);
      throw error;
    }
  };

  return (
    <MedicionesContext.Provider value={{ 
      medicion, 
      setMediciones, 
      crearMediciones, 
      obtenerMedicionesPorPaciente,
      actualizarMedicion,
      eliminarMedicion
    }}>
      {children}
    </MedicionesContext.Provider>
  );

};


export const useMediciones = () => useContext(MedicionesContext);