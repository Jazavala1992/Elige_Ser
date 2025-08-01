import React, { createContext, useContext, useState } from "react";
import { crearConsultaRequest, eliminarConsultaRequest } from "../api/api";

const ConsultasContext = createContext();

export const useConsultas = () => useContext(ConsultasContext);

export const ConsultasProvider = ({ children }) => {
  const [consultas, setConsultas] = useState([]);

  const crearConsulta = async (consulta) => {
    try {
      console.log("Datos de consulta antes de enviar:", consulta);
      const response = await crearConsultaRequest(consulta);
      console.log("Respuesta exitosa del servidor:", response.data);
      
      // Actualizar el estado local con la nueva consulta
      setConsultas((prevConsultas) => [...prevConsultas, response.data]);
      
      return response.data;
    } catch (error) {
      console.error("Error completo al crear consulta:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      throw error;
    }
  };

  const eliminarConsulta = async (id) => {
    try {
      await eliminarConsultaRequest(id);
      
      // Actualizar el estado local removiendo la consulta eliminada
      setConsultas((prevConsultas) => 
        prevConsultas.filter(consulta => consulta.id_consulta !== parseInt(id))
      );
      
      return { success: true, message: 'Consulta eliminada exitosamente' };
    } catch (error) {
      console.error("Error al eliminar consulta:", error);
      throw error;
    }
  };

  return (
    <ConsultasContext.Provider value={{ 
      consultas, 
      setConsultas, 
      crearConsulta,
      eliminarConsulta
    }}>
      {children}
    </ConsultasContext.Provider>
  );
};