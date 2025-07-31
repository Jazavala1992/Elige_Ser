import React, { createContext, useContext, useState } from "react";
import { crearResultadosRequest, obtenerResultadosPorPacienteRequest } from "../api/api";

const ResultadosContext = createContext();

export const ResultadosProvider = ({ children }) => {
  const [resultadoContext, setResultados] = useState([]);

  const crearResultados = async (resultados) => {
    try {
      const response = await crearResultadosRequest(resultados);
      return response.data;
    } catch (error) {
      console.error("Error al crear resultados:", error);
      throw error;
    }
  };

  const obetenerresultadosPorPaciente = async (id) => {
    try {
      const response = await obtenerResultadosPorPacienteRequest(id);
      const resultados = response?.data || response; 
      console.log("Resultados obtenidos del backend:", resultados);
      setResultados(resultados || []);
      return resultados || [];
    } catch (error) {
      console.error("Error al obtener resultados por paciente:", error);
      throw error;
    }
  };

  return (
    <ResultadosContext.Provider value={{ resultadoContext, setResultados, crearResultados, obetenerresultadosPorPaciente }}>
      {children}
    </ResultadosContext.Provider>
  );
};

export const useResultados = () => useContext(ResultadosContext);