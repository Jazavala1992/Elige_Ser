import React from "react";
import Navbar from "../componentes/navbar";
import Cardconsultas from "../componentes/CardConsultas.jsx";
import { ConsultasProvider } from "../context/ConsultasContext";
import { MedicionesProvider } from "../context/MedicionesContext";
import { ResultadosProvider } from "../context/ResultadosContext.jsx";

function Consultas() {
  return (
    <div>
      <Navbar />
      <div className="container">
      <ConsultasProvider>
        <MedicionesProvider>
         <ResultadosProvider>
           <Cardconsultas />
         </ResultadosProvider>
        </MedicionesProvider>
      </ConsultasProvider>
      </div>
    </div>
  );
}

export default Consultas;