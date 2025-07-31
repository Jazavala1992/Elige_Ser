import React, { useState } from "react";
import { IoPersonAdd } from "react-icons/io5";
import "../css/cardpaciente.css"; 
import buzon from "../img/icono.png";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { usePacientes } from "../context/PacientesContext"; // Importar el contexto de Paciente
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; // Importar Yup para validación
import Swal from "sweetalert2"; // Importar SweetAlert2

function CardPaciente() {
  const { crearPaciente } = usePacientes(); 
  const navigate = useNavigate(); // Inicializar el hook para redirección
  const [modalOpen, setModalOpen] = useState(false); 
  const id_usuario = localStorage.getItem("userId");

  // Esquema de validación con Yup
  const validationSchema = Yup.object().shape({
    nombre: Yup.string().required("El nombre es obligatorio"),
    fecha_nacimiento: Yup.date().required("La fecha de nacimiento es obligatoria"),
    sexo: Yup.string().required("El sexo es obligatorio"),
    telefono: Yup.string()
      .required("El teléfono es obligatorio")
      .matches(/^[0-9]+$/, "El teléfono debe contener solo números")
      .min(10, "El teléfono debe tener al menos 10 dígitos")
      .max(15, "El teléfono no puede tener más de 15 dígitos"),
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

  // Manejar la creación del paciente
  const handleCrearPaciente = async (values) => {
    try {
      console.log("Datos enviados al backend:", values); // Inspeccionar los datos
      await crearPaciente(values); // Llamar a la función del contexto

      // Mostrar mensaje de éxito con SweetAlert2
      Swal.fire({
        icon: "success",
        title: "Paciente creado exitosamente",
        text: "El paciente ha sido registrado correctamente.",
        confirmButtonText: "Aceptar",
      });

      setModalOpen(false); // Cerrar el modal
      navigate("/pacientes"); // Redirigir a la nueva ruta
    } catch (error) {
      console.error("Error al crear paciente:", error);

      // Mostrar mensaje de error con SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error al crear paciente",
        text: "Ocurrió un problema al registrar el paciente. Por favor, inténtalo nuevamente.",
        confirmButtonText: "Aceptar",
      });
    }
  };

  return (
    <div className="card">
      <div className="iconContainer">
        <IoPersonAdd className="icon" />
      </div>
      <h3 className="title">Nuevo paciente</h3>
      <img src={buzon} alt="img" />
      <button className="button" onClick={() => setModalOpen(true)}>
        <IoPersonAdd className="buttonIcon" />
        Registrar paciente
      </button>

      {/* Modal para registrar paciente */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} scrollable>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Añadir Paciente</ModalHeader>
        <ModalBody>
          <Formik
            initialValues={{
              id_usuario: id_usuario,
              nombre: "",
              fecha_nacimiento: "",
              sexo: "",
              telefono: "",
              ocupacion: "",
              nivel_actividad: "",
              objetivo: "",
              horas_sueno: "",
              habitos: "",
              antecedentes: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleCrearPaciente}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <Field type="text" name="nombre" className="form-control" />
                  <ErrorMessage name="nombre" component="div" className="error" />
                </div>
                <div className="form-group">
                  <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                  <Field type="date" name="fecha_nacimiento" className="form-control" />
                  <ErrorMessage name="fecha_nacimiento" component="div" className="error" />
                </div>
                <div className="form-group">
                  <label htmlFor="sexo">Sexo</label>
                  <Field as="select" name="sexo" className="form-control">
                    <option value="" disabled>
                      Seleccione
                    </option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </Field>
                  <ErrorMessage name="sexo" component="div" className="error" />
                </div>
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <Field
                    type="text"
                    name="telefono"
                    className="form-control"
                    onInput={(e) => {
                      // Solo permitir números
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    placeholder="Ingrese solo números"
                  />
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
                    <option value="" disabled>
                      Seleccione
                    </option>
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
    </div>
  );
}

export default CardPaciente;