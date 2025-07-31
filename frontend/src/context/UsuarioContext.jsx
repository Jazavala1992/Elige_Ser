import { createContext, useContext, useState, useEffect } from 'react';
import { crearUsuarioRequest, loginUsuarioRequest,  obtenerUsuarioRequest} from '../api/api';

const UsuarioContext = createContext();


export const UsuarioProvider = ({ children }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    const crearUsuario = async (usuario) => {
        try {
            const response = await crearUsuarioRequest(usuario);
            return response.data; 
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw error; 
        }
    }
    const loginUsuario = async (values) => {
        const { email, password } = values;
        try {
            const response = await loginUsuarioRequest({ email, password });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.user.id); // Opcional: Guarda el ID del usuario
            }
            return response; 
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            throw error; 
        }
    };

    const getUsuario = async (id) => {
        try {
          const response = await obtenerUsuarioRequest(id); 
          return response.data; 
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.error("Token inválido o expirado. Redirigiendo al inicio de sesión.");
            localStorage.removeItem('token'); 

          } else {
            console.error("Error al obtener usuario:", error);
            throw error; 
          }
        }
      };

    return (
        <UsuarioContext.Provider value={{ usuarios, loading, crearUsuario, loginUsuario, getUsuario }}>
            {children}
        </UsuarioContext.Provider>
    );
};

export const useUsuarios = () => useContext(UsuarioContext);