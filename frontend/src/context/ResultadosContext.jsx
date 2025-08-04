import React, { createContext, useContext, useState } from "react";
import { crearResultadoRequest, obtenerResultadosPorPacienteRequest } from "../api/api";

const ResultadosContext = createContext();

export const ResultadosProvider = ({ children }) => {
  const [resultadoContext, setResultados] = useState([]);

  const crearResultados = async (resultados) => {
    try {
      const response = await crearResultadoRequest(resultados);
      return response.data;
    } catch (error) {
      console.error("Error al crear resultados:", error);
      throw error;
    }
  };

  const obtenerResultadosPorPaciente = async (id) => {
    try {
      const response = await obtenerResultadosPorPacienteRequest(id);
      const resultados = response?.data || response; 
      console.log("Resultados obtenidos del backend:", resultados);
      
      // Asegurar que siempre devolvemos un array
      const resultadosArray = Array.isArray(resultados) ? resultados : [];
      setResultados(resultadosArray);
      return resultadosArray;
    } catch (error) {
      console.error("Error al obtener resultados por paciente:", error);
      // En caso de error 404 o cualquier otro, devolver array vacío
      setResultados([]);
      return [];
    }
  };

  return (
    <ResultadosContext.Provider value={{ resultadoContext, setResultados, crearResultados, obtenerResultadosPorPaciente }}>
      {children}
    </ResultadosContext.Provider>
  );
};

export const useResultados = () => useContext(ResultadosContext);