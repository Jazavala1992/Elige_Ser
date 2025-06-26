import React from "react";
import Navbar from "../componentes/navbar";
import TablaPacientes from "../componentes/TablaPacientes";
import { PacientesProvider } from "../context/PacientesContext";

function Pacientes() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <PacientesProvider>
         <TablaPacientes />
        </PacientesProvider>
      </div>
    </div>
  );
}

export default Pacientes;