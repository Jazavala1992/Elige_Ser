import "../css/cardusuario.css"; 
import React, { useEffect, useState } from "react";
import { FaUserDoctor } from "react-icons/fa6";
import { useUsuarios } from "../context/UsuarioContext.jsx";

function CardUsuario() {
    const { getUsuario } = useUsuarios();
    const [usuario, setUsuario] = useState({});
    const userId = localStorage.getItem("userId"); // Obtén el ID del usuario desde el localStorage

    // Agregar antes del useEffect:
    console.log("userId desde localStorage:", userId);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                console.log("ID del usuario enviado a getUsuario:", userId); // Depuración
                const data = await getUsuario(userId); // Llama a la función del contexto
                console.log("Datos del usuario obtenidos:", data); // Depuración
                setUsuario(data.user);
                console.log("Usuario establecido en estado:", data.user); // Nuevo log
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        };
        fetchUsuario();
    }, [getUsuario, userId]);

    // Agregar log para ver el estado actual
    console.log("Estado actual del usuario:", usuario);

    // Y dentro del return, antes de mostrar los datos:
    return (
        <div className="card">
            <div className="iconContainer">
                <FaUserDoctor className="icon" />
            </div>
            <h3 className="titleU">Nutricionista:</h3>
            {/* Cambiar la condición para verificar si tiene datos */}
            {!usuario.nombre ? (
                <p>Cargando...</p>
            ) : (
                <div>
                    <p className="textU">Nombre: {usuario.nombre}</p>
                    <p className="textU">Usuario: {usuario.username}</p>
                    <p className="textU">Correo: {usuario.email}</p>
                </div>
            )}
            <button className="button">
                <FaUserDoctor className="buttonIcon" />
                Editar Perfil
            </button>
        </div>
    );
}

export default CardUsuario;