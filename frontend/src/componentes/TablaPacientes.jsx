import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaRulerCombined } from "react-icons/fa"; 
import "../css/tablaPacientes.css";
import { obtenerPacientesRequest} from "../api/api"; 
import { usePacientes } from "../context/PacientesContext";
import { useConsultas } from "../context/ConsultasContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function TablaPacientes() {
  const { pacientes, setPacientes, eliminarPaciente, editPaciente } = usePacientes();
  const { crearConsulta } = useConsultas();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConsultaOpen, setModalConsultaOpen] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [pacienteParaConsulta, setPacienteParaConsulta] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true); 
        const response = await obtenerPacientesRequest(); 
        setPacientes(response.data); 
        setLoading(false); 
      } catch (err) {
        console.error("Error al obtener los pacientes:", err);
        setError("No se pudieron cargar los pacientes. Inténtalo más tarde.");
        setLoading(false); 
      }
    };
  
    fetchPacientes();
  }, [setPacientes]);

  const handleMediciones = (idPaciente) => {
    navigate(`/consultas/${idPaciente}`);
  };

  const handleNuevaConsulta = (idPaciente) => {
    const paciente = pacientes.find((p) => p.id_paciente === idPaciente);
    if (paciente) {
      setPacienteParaConsulta(paciente);
      setModalConsultaOpen(true);
    }
  };

  const handleEditar = (idPaciente) => {
    const paciente = pacientes.find((p) => p.id_paciente === idPaciente);
    if (paciente) {
      setPacienteSeleccionado(paciente);
      setModalOpen(true); // Abre el modal
    }
  };

  const validationSchema = Yup.object().shape({
    nombre: Yup.string().required("El nombre es obligatorio"),
    telefono: Yup.string().required("El teléfono es obligatorio"),
    ocupacion: Yup.string().required("La ocupación es obligatoria"),
    nivel_actividad: Yup.string().required("El nivel de actividad es obligatorio"),
    objetivo: Yup.string().required("El objetivo es obligatorio"),
    horas_sueno: Yup.number()
      .required("Las horas de sueño son obligatorias")
      .min(1, "Debe dormir al menos 1 hora")
      .max(24, "No puede dormir más de 24 horas"),
    habitos: Yup.string().required("Los hábitos son obligatorios"),
    antecedentes: Yup.string().required("Los antecedentes son obligatorios"),
  });

  const consultaValidationSchema = Yup.object().shape({
    fecha_consulta: Yup.date().required("La fecha de consulta es obligatoria"),
    Hora: Yup.string().required("La hora es obligatoria"),
    observaciones: Yup.string().required("Las observaciones son obligatorias"),
  });

  const handleSubmitEditar = async (values) => {
    try {
      await editPaciente(pacienteSeleccionado.id_paciente, values);
      setPacientes((prevPacientes) =>
        prevPacientes.map((paciente) =>
          paciente.id_paciente === pacienteSeleccionado.id_paciente
            ? { ...paciente, ...values }
            : paciente
        )
      );
      Swal.fire("Actualizado", "El paciente ha sido actualizado correctamente.", "success");
      setModalOpen(false); // Cierra el modal
    } catch (error) {
      console.error("Error al actualizar el paciente:", error);
      Swal.fire("Error", "No se pudo actualizar el paciente. Inténtalo más tarde.", "error");
    }
  };

  const handleSubmitConsulta = async (values) => {
    try {
      const consultaData = {
        ...values,
        id_paciente: pacienteParaConsulta.id_paciente,
      };
      
      console.log("Datos de consulta a enviar:", consultaData);
      
      await crearConsulta(consultaData);
      
      Swal.fire({
        icon: "success",
        title: "Consulta creada exitosamente",
        text: `La consulta para ${pacienteParaConsulta.nombre} ha sido registrada correctamente.`,
        confirmButtonText: "Aceptar",
      });
      
      setModalConsultaOpen(false);
    } catch (error) {
      console.error("Error al crear consulta:", error);
      
      let errorMessage = "Ocurrió un problema al crear la consulta. Por favor, inténtalo nuevamente.";
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Error de validación en los datos de la consulta.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
      } else if (error.response?.status === 500) {
        errorMessage = "Error interno del servidor. Contacta al administrador.";
      }
      
      Swal.fire({
        icon: "error",
        title: "Error al crear consulta",
        text: errorMessage,
        confirmButtonText: "Aceptar",
      });
    }
  };

  const handleEliminar = async (idPaciente) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarPaciente(idPaciente);
          setPacientes((prevPacientes) =>
            prevPacientes.filter((paciente) => paciente.id_paciente !== idPaciente)
          );
          Swal.fire("Eliminado", "El paciente ha sido eliminado correctamente.", "success");
        } catch (error) {
          console.error("Error al eliminar el paciente:", error);
          Swal.fire("Error", "No se pudo eliminar el paciente. Inténtalo más tarde.", "error");
        }
      }
    });
  };

  if (loading) {
    return <p>Cargando pacientes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div className="paciente-header">
        <h1 className="cards-titulo">Pacientes</h1>
      </div>
      <div className="paciente-container">
        {pacientes.map((paciente) => (
          <div key={paciente.id_paciente} className="paciente-card">
            <h2 className="card-nombre">{paciente.nombre}</h2>
            <p><strong>Edad:</strong> {new Date().getFullYear() - new Date(paciente.fecha_nacimiento).getFullYear()} años</p>
            <p><strong>Sexo:</strong> {paciente.sexo}</p>
            <p><strong>Teléfono:</strong> {paciente.telefono}</p>
            <p><strong>Ocupación:</strong> {paciente.ocupacion}</p>
            <p><strong>Nivel de Actividad:</strong> {paciente.nivel_actividad}</p>
            <p><strong>Objetivo:</strong> {paciente.objetivo}</p>
            <p><strong>Horas de Sueño:</strong> {paciente.horas_sueno}</p>
            <p><strong>Hábitos:</strong> {paciente.habitos}</p>
            <p><strong>Antecedentes:</strong> {paciente.antecedentes}</p>
            <div className="card-buttons">
              <FaEdit
                className="icon editar"
                title="Editar"
                onClick={() => handleEditar(paciente.id_paciente)}
              />
              <FaTrash
                className="icon eliminar"
                title="Eliminar"
                onClick={() => handleEliminar(paciente.id_paciente)}
              />
              <FaPlus
                className="icon nueva-consulta"
                title="Nueva Consulta"
                onClick={() => handleNuevaConsulta(paciente.id_paciente)}
              />
              <FaRulerCombined
                className="icon mediciones"
                title="Mediciones"
                onClick={() => handleMediciones(paciente.id_paciente)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modal para editar paciente */}
      {modalOpen && (
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Editar Paciente</ModalHeader>
          <ModalBody>
            <Formik
              initialValues={{
                nombre: pacienteSeleccionado.nombre,
                telefono: pacienteSeleccionado.telefono,
                ocupacion: pacienteSeleccionado.ocupacion,
                nivel_actividad: pacienteSeleccionado.nivel_actividad,
                objetivo: pacienteSeleccionado.objetivo,
                horas_sueno: pacienteSeleccionado.horas_sueno,
                habitos: pacienteSeleccionado.habitos,
                antecedentes: pacienteSeleccionado.antecedentes,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmitEditar}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <Field type="text" name="nombre" className="form-control" />
                    <ErrorMessage name="nombre" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <Field type="text" name="telefono" className="form-control" />
                    <ErrorMessage name="telefono" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ocupacion">Ocupación</label>
                    <Field type="text" name="ocupacion" className="form-control" />
                    <ErrorMessage name="ocupacion" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nivel_actividad">Nivel de Actividad</label>
                    <Field as="select" name="nivel_actividad" className="form-control">
                      <option value="" disabled>Seleccione</option>
                      <option value="Bajo">Bajo</option>
                      <option value="Moderado">Moderado</option>
                      <option value="Alto">Alto</option>
                    </Field>
                    <ErrorMessage name="nivel_actividad" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="objetivo">Objetivo</label>
                    <Field type="text" name="objetivo" className="form-control" />
                    <ErrorMessage name="objetivo" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="horas_sueno">Horas de Sueño</label>
                    <Field type="number" name="horas_sueno" className="form-control" />
                    <ErrorMessage name="horas_sueno" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="habitos">Hábitos</label>
                    <Field as="textarea" name="habitos" className="form-control" />
                    <ErrorMessage name="habitos" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="antecedentes">Antecedentes</label>
                    <Field as="textarea" name="antecedentes" className="form-control" />
                    <ErrorMessage name="antecedentes" component="div" className="error" />
                  </div>
                  <ModalFooter>
                    <Button type="submit" color="primary" disabled={isSubmitting}>
                      {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button color="secondary" onClick={() => setModalOpen(false)}>
                      Cancelar
                    </Button>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </ModalBody>
        </Modal>
      )}

      {/* Modal para crear nueva consulta */}
      {modalConsultaOpen && pacienteParaConsulta && (
        <Modal isOpen={modalConsultaOpen} toggle={() => setModalConsultaOpen(!modalConsultaOpen)}>
          <ModalHeader toggle={() => setModalConsultaOpen(!modalConsultaOpen)}>
            Nueva Consulta para {pacienteParaConsulta.nombre}
          </ModalHeader>
          <ModalBody>
            <Formik
              initialValues={{
                fecha_consulta: new Date().toISOString().split('T')[0], // Fecha actual por defecto
                Hora: "",
                observaciones: "",
              }}
              validationSchema={consultaValidationSchema}
              onSubmit={handleSubmitConsulta}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label htmlFor="fecha_consulta">Fecha de Consulta</label>
                    <Field type="date" name="fecha_consulta" className="form-control" />
                    <ErrorMessage name="fecha_consulta" component="div" className="error" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="Hora">Hora</label>
                    <Field type="time" name="Hora" className="form-control" />
                    <ErrorMessage name="Hora" component="div" className="error" />
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
                      {isSubmitting ? "Creando..." : "Crear Consulta"}
                    </Button>
                    <Button color="secondary" onClick={() => setModalConsultaOpen(false)}>
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

export default TablaPacientes;