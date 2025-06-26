import { Link } from "react-router-dom";
import "../css/navbar.css";
import logo from "../img/Isotipo.png";
import { CiLogout } from "react-icons/ci";
import { IoPerson } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import Swal from "sweetalert2";
import { registrarLogRequest } from "../api/api.js";

function Navbar() {
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No hay token presente. No se puede cerrar sesión automáticamente.");
        return;
      }
  
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Se cerrará tu sesión actual.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
      });
  
      if (result.isConfirmed) {
        const ip = "127.0.0.1";
        const browser = navigator.userAgent;
        const event = "Salida";
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  
        const logData = { ip, evento: event, navegador: browser, fecha_hora: timestamp };
  
        try {
          await registrarLogRequest(logData);
          console.log("Log registrado correctamente");
        } catch (error) {
          console.error("Error al registrar el log:", error);
          // Continuar con el cierre de sesión incluso si el registro del log falla
        }
  
        localStorage.removeItem("token");
        console.log("Token eliminado de localStorage:", localStorage.getItem("token")); // Debería ser null
  
        await Swal.fire({
          icon: "success",
          title: "Sesión cerrada correctamente",
          showConfirmButton: true,
          timer: 6500,
        });
  
        // Redirige después de que todas las operaciones se completen
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cerrar sesión",
        text: "Por favor, inténtelo de nuevo.",
      });
    }
  };
  return (
    <div className="navbar">
      <div className="col" style={{ flex: "10%" }}>
        <img src={logo} alt="Logo" />
      </div>
      <div className="col" style={{ flex: "60%" }}>
        <h1 style={{ color: "white" }}>elige ser</h1>
      </div>
      <div className="col" style={{ flex: "10%" }}>
        <Link to="/pacientes" style={{ textDecoration: "none", color: "#ffffff" }}>
          <IoPerson
            style={{
              cursor: "pointer",
              width: "30px",
              height: "30px",
              marginLeft: "12px",
              marginTop: "10px",
            }}
          />
          <p style={{ color: "#ffffff", fontSize: "14px", fontFamily: "serif" }}>Pacientes</p>
        </Link>
      </div>
      <div className="col" style={{ flex: "10%" }}>
        <Link to="/home" style={{ textDecoration: "none", color: "#ffffff" }}>
          <IoHome
            style={{
              cursor: "pointer",
              width: "30px",
              height: "30px",
              marginLeft: "2px",
              marginTop: "10px",
            }}
          />
          <p style={{ color: "#ffffff", fontSize: "14px", fontFamily: "serif" }}>Inicio</p>
        </Link>
      </div>
      <div className="col" style={{ flex: "10%" }}>
      <CiLogout
        onClick={handleLogout} // Solo se ejecuta cuando el usuario hace clic
        style={{
          cursor: "pointer",
          color: "#ffffff",
          width: "30px",
          height: "30px",
          marginLeft: "17px",
          marginTop: "10px",
        }}
      />
        <p style={{ color: "#ffffff", fontSize: "14px", fontFamily: "serif" }}>Cerrar sesión</p>
      </div>
    </div>
  );
}

export default Navbar;