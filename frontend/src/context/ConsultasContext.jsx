import React, { createContext, useContext, useState } from "react";

const ConsultasContext = createContext();

export const useConsultas = () => useContext(ConsultasContext);

export const ConsultasProvider = ({ children }) => {
  const [consultas, setConsultas] = useState([]);

  return (
    <ConsultasContext.Provider value={{ consultas, setConsultas }}>
      {children}
    </ConsultasContext.Provider>
  );
};