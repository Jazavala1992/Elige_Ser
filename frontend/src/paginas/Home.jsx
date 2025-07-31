import React from "react";
import Navbar from "../componentes/navbar";
import CardPaciente from "../componentes/Cardpaciente";
import CardUsuario from "../componentes/Cardusuario";
import { PacientesProvider } from "../context/PacientesContext";


function Home() {
    return (
        <div className="home">
            <Navbar />
            <div className="row">
                <div className="col" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <PacientesProvider>
                    <CardPaciente />
                    </PacientesProvider>
                </div>
                <div className="col" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <CardUsuario />
                </div>
            </div>
        </div>
    );
}

export default Home;