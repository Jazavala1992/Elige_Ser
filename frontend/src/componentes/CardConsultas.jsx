import React, { useEffect, useState } from "react";
import { FaRulerCombined, FaTrash } from "react-icons/fa"; 
import "../css/cardconsultas.css";
import { obtenerConsultasRequest } from "../api/api"; 
import { useConsultas } from "../context/ConsultasContext";
import { useParams } from "react-router-dom";
import { MedicionesProvider } from "../context/MedicionesContext";
import { ResultadosProvider } from "../context/ResultadosContext"; 
import Mediciones from "./Mediciones";
import Swal from 'sweetalert2';

function CardConsultas() {
  const { idPaciente } = useParams(); 
  const { consultas, setConsultas, eliminarConsulta } = useConsultas();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarMediciones, setMostrarMediciones] = useState(false); // Estado para controlar la visibilidad
  const [idConsultaSeleccionada, setIdConsultaSeleccionada] = useState(null); // Estado para almacenar el id_consulta

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        setLoading(true);
        if (idPaciente) {
          // Si hay ID de paciente, obtener consultas específicas
          const response = await obtenerConsultasRequest(idPaciente); 
          setConsultas(response.data);
        } else {
          // Si no hay ID, mostrar mensaje informativo o redirigir
          setError("Seleccione un paciente para ver sus consultas.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener las consultas:", err);
        setError("No se pudieron cargar las consultas. Inténtalo más tarde.");
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [idPaciente, setConsultas]);

  const handleMediciones = (idConsulta) => {
    setIdConsultaSeleccionada(idConsulta); // Almacena el id_consulta seleccionado
    setMostrarMediciones(true); // Muestra el componente Mediciones
  };

  const handleEliminarConsulta = async (idConsulta, fechaConsulta) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la consulta del ${new Date(fechaConsulta).toLocaleDateString("es-ES")}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await eliminarConsulta(idConsulta);
        Swal.fire({
          title: 'Eliminado',
          text: 'La consulta ha sido eliminada exitosamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error al eliminar consulta:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la consulta. Inténtalo de nuevo.',
          icon: 'error'
        });
      }
    }
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
              <div className="eliminar-container">
                <FaTrash
                  className="icon eliminar"
                  title="Eliminar Consulta"
                  onClick={() => handleEliminarConsulta(consulta.id_consulta, consulta.fecha_consulta)}
                />
                <p className="eliminar-text">Eliminar</p>
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