import React, { useEffect, useState } from "react";
import { FaRulerCombined } from "react-icons/fa"; 
import "../css/cardconsultas.css";
import { obtenerConsultasRequest } from "../api/api"; 
import { useConsultas } from "../context/ConsultasContext";
import { useParams } from "react-router-dom";
import { MedicionesProvider } from "../context/MedicionesContext";
import { ResultadosProvider } from "../context/ResultadosContext"; 
import Mediciones from "./Mediciones";

function CardConsultas() {
  const { idPaciente } = useParams(); 
  const { consultas, setConsultas } = useConsultas();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarMediciones, setMostrarMediciones] = useState(false); // Estado para controlar la visibilidad
  const [idConsultaSeleccionada, setIdConsultaSeleccionada] = useState(null); // Estado para almacenar el id_consulta

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        setLoading(true);
        const response = await obtenerConsultasRequest(idPaciente); 
        setConsultas(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener las consultas:", err);
        setError("No se pudieron cargar las consultas. Inténtalo más tarde.");
        setLoading(false);
      }
    };

    if (idPaciente) {
      fetchConsultas();
    } else {
      console.error("ID del paciente no proporcionado");
    }
  }, [idPaciente, setConsultas]);

  const handleMediciones = (idConsulta) => {
    setIdConsultaSeleccionada(idConsulta); // Almacena el id_consulta seleccionado
    setMostrarMediciones(true); // Muestra el componente Mediciones
  };

  return (
    <div>
      <div className="consulta-header">
        <h1 className="consulta-titulo">Consultas</h1>
      </div>
      <div className="consulta-container">
        {consultas.map((consulta) => (
          <div key={consulta.id_consulta} className="consulta-card">
            <div className="consulta-cardheader">
              <h2 className="consultacard-nombre">Consulta</h2>
            </div>  
            <p>
              <strong>Fecha:</strong> {new Date(consulta.fecha_consulta).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p><strong>Hora:</strong> {consulta.Hora}</p>
            <p><strong>Observaciones:</strong> {consulta.observaciones}</p>
            <div className="card-buttons">
              <div className="mediciones-container">
                <FaRulerCombined
                  className="icon mediciones"
                  title="Mediciones"
                  onClick={() => handleMediciones(consulta.id_consulta)} // Envía el id_consulta
                />
                <p className="mediciones-text">Realizar Mediciones</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mostrarMediciones && (
        <MedicionesProvider>
          <ResultadosProvider>
          <Mediciones 
            idConsulta={idConsultaSeleccionada} // Pasa el id_consulta seleccionado
            idPaciente={idPaciente} // Pasa el idPaciente
            setMostrarMediciones={setMostrarMediciones} 
          />
          </ResultadosProvider>
        </MedicionesProvider>
        
      )}
    </div>
  );
}

export default CardConsultas;