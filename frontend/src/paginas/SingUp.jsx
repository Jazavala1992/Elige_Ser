import '../css/signup.css';
import logo from '../img/Isotipo.png';
import { NavLink } from 'react-router-dom'; 
import { NavItem, Nav } from 'reactstrap';
import { useUsuarios } from '../context/UsuarioContext.jsx';
import {Form, Formik} from "formik";
import React, { useState } from "react";

function SignUp() {
  const { crearUsuario } = useUsuarios();
  const [fortalezaPassword, setFortalezaPassword] = useState("");

  const evaluarFortalezaPassword = (password) => {
    if (password.length < 6) {
      return "Débil";
    }
    if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8) {
      return "Fuerte";
    }
    return "Intermedio";
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFortalezaPassword(evaluarFortalezaPassword(password));
  };

  return (
    <div>
      <div className="singup-page">
        <div className="col" style={{ flex: "35%" }}>
          <div className="singup-container">
            <img src={logo} alt="Logo" className="logo" />
            <h1>Elige Ser</h1>
            <div>
              <Nav justified>
                <NavItem className="nav-item">
                  <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                    Sign In
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/signup" className={({ isActive }) => (isActive ? "active" : "")}>
                    Sign Up
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          </div>
        </div>
        <div className="col" style={{ flex: "65%" }}>
          <div className="crearusuario-container">
            <>
              <Formik
                initialValues={{
                  nombre: "",
                  username: "",
                  email: "",
                  password: "",
                }}
                onSubmit={async (values, actions) => {
                  try {
                    await crearUsuario(values);
                    console.log("Datos del usuario:", values);
                    actions.resetForm();
                    window.location.href = "/";
                  } catch (error) {
                    console.error("Error al crear el usuario:", error);
                  }
                }}
              >
                {({ handleChange, handleSubmit, values, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <h2>Crear Usuario</h2>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>Nombre</label>
                          <input
                            type="text"
                            name="nombre"
                            placeholder="Introduzca el nombre"
                            onChange={handleChange}
                            value={values.nombre}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            name="username"
                            placeholder="Introduzca el nombre de usuario"
                            onChange={handleChange}
                            value={values.username}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>e-mail</label>
                          <input
                            type="text"
                            name="email"
                            placeholder="Introduzca el correo electrónico"
                            onChange={handleChange}
                            value={values.email}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            name="password"
                            placeholder="Introduzca la contraseña"
                            onChange={(e) => {
                              handleChange(e);
                              handlePasswordChange(e);
                            }}
                            value={values.password}
                          />
                          <p>Fortaleza: {fortalezaPassword}</p>
                        </div>
                      </div>
                    </div>
                    <div className="btns">
                      <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando" : "Guardar"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;