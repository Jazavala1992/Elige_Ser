import "../css/cardusuario.css"; 
import React, { useEffect, useState } from "react";
import { FaUserDoctor } from "react-icons/fa6";
import { useUsuarios } from "../context/UsuarioContext.jsx";

function CardUsuario() {
    const { getUsuario } = useUsuarios();
    const [usuario, setUsuario] = useState({});
    const userId = localStorage.getItem("userId"); // Obtén el ID del usuario desde el localStorage

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                console.log("ID del usuario enviado a getUsuario:", userId); // Depuración
                const data = await getUsuario(userId); // Llama a la función del contexto
                console.log("Datos del usuario obtenidos:", data); // Depuración
                setUsuario(data); // Actualiza el estado con los datos del usuario
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        };
        fetchUsuario();
    }, [getUsuario, userId]);

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
            <button className="button">
                <FaUserDoctor className="buttonIcon" />
                Editar Perfil
            </button>
        </div>
    );
}

export default CardUsuario;