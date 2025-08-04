import "../css/cardusuario.css"; 
import React, { useEffect, useState } from "react";
import { FaUserDoctor, FaEdit } from "react-icons/fa6";
import { useUsuarios } from "../context/UsuarioContext.jsx";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function CardUsuario() {
    const { getUsuario, actualizarUsuario } = useUsuarios();
    const [usuario, setUsuario] = useState({});
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const userId = localStorage.getItem("userId");

    // Esquema de validación
    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required("El nombre es obligatorio"),
        apellido_paterno: Yup.string().required("El apellido paterno es obligatorio"),
        apellido_materno: Yup.string().required("El apellido materno es obligatorio"),
        email: Yup.string().email("Email inválido").required("El email es obligatorio"),
        telefono: Yup.string()
            .required("El teléfono es obligatorio")
            .matches(/^[0-9]+$/, "El teléfono debe contener solo números")
            .min(8, "El teléfono debe tener al menos 8 dígitos")
            .max(15, "El teléfono no puede tener más de 15 dígitos"),
    });

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                console.log("ID del usuario enviado a getUsuario:", userId);
                const data = await getUsuario(userId);
                console.log("Datos del usuario obtenidos:", data);
                setUsuario(data);
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        };
        fetchUsuario();
    }, [getUsuario, userId]);

    const handleEditarPerfil = () => {
        setModalEditarOpen(true);
    };

    const handleGuardarEdicion = async (values) => {
        try {
            await actualizarUsuario(userId, values);
            setUsuario({ ...usuario, ...values });
            setModalEditarOpen(false);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
        }
    };

    return (
        <div className="card">
            <div className="iconContainer">
                <FaUserDoctor className="icon" />
            </div>
            <h3 className="titleU">Nutricionista:</h3>
            <div>
                <p className="textU">Nombre: {usuario.nombre}</p>
                <p className="textU">Apellido: {usuario.apellido_paterno}</p>
                <p className="textU">Correo: {usuario.email}</p>
            </div>
            <button className="button" onClick={handleEditarPerfil}>
                <FaEdit className="buttonIcon" />
                Editar Perfil
            </button>

            {/* Modal para editar usuario */}
            <Modal isOpen={modalEditarOpen} toggle={() => setModalEditarOpen(!modalEditarOpen)} scrollable>
                <ModalHeader toggle={() => setModalEditarOpen(!modalEditarOpen)}>
                    Editar Perfil
                </ModalHeader>
                <ModalBody>
                    <Formik
                        initialValues={{
                            nombre: usuario.nombre || "",
                            apellido_paterno: usuario.apellido_paterno || "",
                            apellido_materno: usuario.apellido_materno || "",
                            email: usuario.email || "",
                            telefono: usuario.telefono || "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleGuardarEdicion}
                        enableReinitialize={true}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre</label>
                                    <Field type="text" name="nombre" className="form-control" />
                                    <ErrorMessage name="nombre" component="div" className="error" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apellido_paterno">Apellido Paterno</label>
                                    <Field type="text" name="apellido_paterno" className="form-control" />
                                    <ErrorMessage name="apellido_paterno" component="div" className="error" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apellido_materno">Apellido Materno</label>
                                    <Field type="text" name="apellido_materno" className="form-control" />
                                    <ErrorMessage name="apellido_materno" component="div" className="error" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <Field type="email" name="email" className="form-control" />
                                    <ErrorMessage name="email" component="div" className="error" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefono">Teléfono</label>
                                    <Field name="telefono">
                                        {({ field, form }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                className="form-control"
                                                placeholder="Ingrese solo números"
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    form.setFieldValue('telefono', value);
                                                }}
                                                onBlur={field.onBlur}
                                                value={field.value || ''}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name="telefono" component="div" className="error" />
                                </div>
                                <ModalFooter>
                                    <Button type="submit" color="primary" disabled={isSubmitting}>
                                        {isSubmitting ? "Guardando..." : "Guardar"}
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
        </div>
    );
}

export default CardUsuario;