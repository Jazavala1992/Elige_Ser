import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './img/Isotipo.png';
import { NavLink } from 'react-router-dom';
import { NavItem, Nav } from 'reactstrap';
import './App.css';
import { useUsuarios } from './context/UsuarioContext.jsx';
import { Form, Formik } from "formik";
import * as Yup from "yup"; // Importar Yup para validación
import { useNavigate } from 'react-router-dom';


function App() {
  const [email] = useState('');
  const [password] = useState('');
  const { loginUsuario } = useUsuarios();
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  // Genera un CAPTCHA aleatorio
  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return `${num1} + ${num2}`;
  }

  // Verifica si el CAPTCHA es correcto
  function verifyCaptcha() {
    const [num1, num2] = captcha.split(" + ").map(Number);
    return num1 + num2 === parseInt(captchaInput, 10);
  }

  const handleLogin = async (values) => {
    try {
      // Verificar el CAPTCHA antes de proceder
      if (!verifyCaptcha()) {
        alert("CAPTCHA incorrecto. Por favor, inténtalo de nuevo.");
        setCaptcha(generateCaptcha()); // Genera un nuevo CAPTCHA
        return;
      }
  
      // Realizar la solicitud de inicio de sesión al backend
      const response = await loginUsuario(values);
  
      if (response.data.success) {
        // Guardar el token y redirigir al usuario
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.user.id);
        navigate("/home");
      } else {
        alert(response.data.message || "Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error al iniciar sesión. Por favor, inténtalo más tarde.");
    }
  };

  // Esquema de validación con Yup
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Debe ser un correo electrónico válido")
      .required("El correo electrónico es obligatorio"),
    password: Yup.string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .required("La contraseña es obligatoria"),
  });

  return (
    <div className='login-page'>
      <div className="login-container">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Elige Ser</h1>
      <div>
          <Nav justified>
            <NavItem className="nav-item">
              <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                Sign In
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/signup" className={({ isActive }) => (isActive ? 'active' : '')}>
                Sign Up
              </NavLink>
            </NavItem>
          </Nav>
      </div>
      <>
        <Formik 
           initialValues={{
             email: '',
             password: '',
           }}
           validationSchema={validationSchema} // Agregar esquema de validación
           onSubmit={async (values) => {
            await handleLogin(values); // Llama a handleLogin con los valores del formulario
          }}
        >
          {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  value={values.email}
                />
                {errors.email && touched.email && (
                  <div className="error">{errors.email}</div>
                )}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  onChange={handleChange}
                  value={values.password}
                />
                {errors.password && touched.password && (
                  <div className="error">{errors.password}</div>
                )}
              </div>      
              <div className="form-group">
                <label>Resuelve el CAPTCHA: {captcha}</label>
                <input
                  type="text"
                  placeholder="Resultado"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                />
              </div>        
              <div className="btns">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Entrando" : "LogIn"}
              </button>
              </div>
            </Form>
          )}
        </Formik>         
      </> 
    </div>
    </div>
  );
}

export default App;