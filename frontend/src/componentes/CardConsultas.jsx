import React, { useEffect, useState } from "react";
import { FaRulerCombined, FaTrash, FaEdit } from "react-icons/fa"; 
import "../css/cardconsultas.css";
import { obtenerConsultasRequest } from "../api/api"; 
import { useConsultas } from "../context/ConsultasContext";
import { useParams } from "react-router-dom";
import { MedicionesProvider } from "../context/MedicionesContext";
import { ResultadosProvider } from "../context/ResultadosContext"; 
import { PacientesProvider } from "../context/PacientesContext";
import Mediciones from "./Mediciones";
import Swal from 'sweetalert2';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function CardConsultas() {
  const { idPaciente } = useParams(); 
  const { consultas, setConsultas, eliminarConsulta, actualizarConsulta } = useConsultas();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarMediciones, setMostrarMediciones] = useState(false);
  const [idConsultaSeleccionada, setIdConsultaSeleccionada] = useState(null);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);

  // Esquema de validación para editar consulta
  const validationSchema = Yup.object().shape({
    fecha_consulta: Yup.date().required("La fecha de consulta es obligatoria"),
    hora: Yup.string().required("La hora es obligatoria"),
    observaciones: Yup.string().required("Las observaciones son obligatorias"),
  });

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

  const handleEditarConsulta = (consulta) => {
    setConsultaSeleccionada(consulta);
    setModalEditarOpen(true);
  };

  const handleGuardarEdicion = async (values) => {
    try {
      await actualizarConsulta(consultaSeleccionada.id_consulta, values);
      
      // Actualizar el estado local
      setConsultas(prevConsultas =>
        prevConsultas.map(consulta =>
          consulta.id_consulta === consultaSeleccionada.id_consulta
            ? { ...consulta, ...values }
            : consulta
        )
      );

      Swal.fire({
        icon: 'success',
        title: 'Consulta actualizada exitosamente',
        timer: 1500,
        showConfirmButton: false
      });

      setModalEditarOpen(false);
    } catch (error) {
      console.error("Error al actualizar consulta:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar la consulta',
        text: 'Inténtalo de nuevo'
      });
    }
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
                  onClick={() => handleMediciones(consulta.id_consulta)}
                />
                <p className="mediciones-text">Realizar Mediciones</p>
              </div>
              <div className="editar-container">
                <FaEdit
                  className="icon editar"
                  title="Editar Consulta"
                  onClick={() => handleEditarConsulta(consulta)}
                />
                <p className="editar-text">Editar</p>
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
        <PacientesProvider>
          <MedicionesProvider>
            <ResultadosProvider>
            <Mediciones 
              idConsulta={idConsultaSeleccionada}
              idPaciente={idPaciente}
              setMostrarMediciones={setMostrarMediciones} 
            />
            </ResultadosProvider>
          </MedicionesProvider>
        </PacientesProvider>
      )}

      {/* Modal para editar consulta */}
      {modalEditarOpen && consultaSeleccionada && (
        <Modal isOpen={modalEditarOpen} toggle={() => setModalEditarOpen(!modalEditarOpen)}>
          <ModalHeader toggle={() => setModalEditarOpen(!modalEditarOpen)}>
            Editar Consulta
          </ModalHeader>
          <ModalBody>
            <Formik
              initialValues={{
                fecha_consulta: consultaSeleccionada.fecha_consulta,
                hora: consultaSeleccionada.Hora || consultaSeleccionada.hora,
                observaciones: consultaSeleccionada.observaciones || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleGuardarEdicion}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label htmlFor="fecha_consulta">Fecha de Consulta</label>
                    <Field type="date" name="fecha_consulta" className="form-control" />
                    <ErrorMessage name="fecha_consulta" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hora">Hora</label>
                    <Field type="time" name="hora" className="form-control" />
                    <ErrorMessage name="hora" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="observaciones">Observaciones</label>
                    <Field 
                      as="textarea" 
                      name="observaciones" 
                      className="form-control" 
                      rows="4"
                      placeholder="Ingrese las observaciones de la consulta..."
                    />
                    <ErrorMessage name="observaciones" component="div" className="error" />
                  </div>
                  <ModalFooter>
                    <Button type="submit" color="primary" disabled={isSubmitting}>
                      {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                    <Button color="secondary" onClick={() => setModalEditarOpen(false)}>
                      Cancelar
                    </Button>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

export default CardConsultas;