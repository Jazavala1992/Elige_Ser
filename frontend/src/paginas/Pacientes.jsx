import React from "react";
import Navbar from "../componentes/navbar";
import TablaPacientes from "../componentes/TablaPacientes";
import { PacientesProvider } from "../context/PacientesContext";
import { ConsultasProvider } from "../context/ConsultasContext";

function Pacientes() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <PacientesProvider>
          <ConsultasProvider>
            <TablaPacientes />
          </ConsultasProvider>
        </PacientesProvider>
      </div>
    </div>
  );
}

export default Pacientes;