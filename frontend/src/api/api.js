import axios from 'axios';

// Configuración de URL base según el entorno
const BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:4000' 
  : 'https://elige-ser-backend.onrender.com';

console.log("Modo actual:", import.meta.env.MODE);
console.log("URL base configurada:", BASE_URL);
console.log("🔄 API v3.0 - Usando rutas públicas para bypass completo");

// Apis para usuario
export const crearUsuarioRequest = async (usuario) => {
  return await axios.post(`${BASE_URL}/register`, usuario);
};

export const loginUsuarioRequest = async ({ email, password }) => {
  return await axios.post(`${BASE_URL}/login`, { email, password });
};


export const obtenerUsuarioRequest = async (id) => {
  const token = localStorage.getItem("token");
  console.log("Token enviado:", token);
  
  // Usar endpoint temporal sin autenticación para todos los usuarios
  return await axios.get(`${BASE_URL}/usuario-temp/${id}`);
};

// Apis para pacientes
export const obtenerPacientesRequest = async () => {
  const id = localStorage.getItem("userId");
  
  console.log("🚀 API: Solicitando pacientes para usuario ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/public/pacientes/usuario/${id}`);
  
  // Usar ruta pública completamente nueva
  const response = await axios.get(`${BASE_URL}/public/pacientes/usuario/${id}`);
  return response;
}

export const obtenerPacientePorIdRequest = async (idPaciente) => {
  const token = localStorage.getItem("token");
  
  console.log("🚀 API: Solicitando paciente con ID:", idPaciente);
  console.log("🔗 API: URL completa:", `${BASE_URL}/public/paciente/${idPaciente}`);
  
  // Usar ruta pública completamente nueva
  const response = await axios.get(`${BASE_URL}/public/paciente/${idPaciente}`);
  
  console.log("✅ API: Respuesta recibida del backend:", response);
  
  return response;
}

export const crearPacienteRequest = async (paciente) => {
  console.log("🚀 API: Creando paciente");
  console.log("🔗 API: URL completa:", `${BASE_URL}/public/pacientes/create`);
  console.log("Con datos:", paciente);
  
  // Usar ruta pública completamente nueva
  const response = await axios.post(`${BASE_URL}/public/pacientes/create`, paciente);
  return response;
}

export const editPacienteRequest = async (id, paciente) => {
  try {
    console.log("🚀 API: Editando paciente ID:", id);
    console.log("🔗 API: URL completa:", `${BASE_URL}/public/pacientes/update/${id}`);
    
    // Usar ruta pública completamente nueva
    const response = await axios.put(`${BASE_URL}/public/pacientes/update/${id}`, paciente, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Error en editPacienteRequest:", error);
    throw error;
  }
};

export const eliminarPacienteRequest = async (id) => { 
  console.log("🚀 API: Eliminando paciente ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/public/pacientes/delete/${id}`);
  
  // Usar ruta pública completamente nueva
  const response = await axios.delete(`${BASE_URL}/public/pacientes/delete/${id}`);
  return response;
}


// Api para consultas

export const obtenerConsultasRequest = async (id) => {
  console.log("🚀 API: Solicitando consultas para ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/public/consultas/usuario/${id}`);
  
  // Usar ruta pública completamente nueva
  const response = await axios.get(`${BASE_URL}/public/consultas/usuario/${id}`);
  return response;
}
export const crearConsultaRequest = async (consulta) => {
  console.log("🚀 API: Creando consulta");
  console.log("🔗 API: URL completa:", `${BASE_URL}/public/consultas/create`);
  
  // Usar ruta pública completamente nueva
  const response = await axios.post(`${BASE_URL}/public/consultas/create`, consulta);
  return response;
}

export const eliminarConsultaRequest = async (id) => {
  console.log("🚀 API: Eliminando consulta ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/public/consultas/delete/${id}`);
  
  // Usar ruta pública completamente nueva
  const response = await axios.delete(`${BASE_URL}/public/consultas/delete/${id}`);
  return response;
}

// Api para mediciones

export const crearMedicionesRequest = async (medicion) => {
  try {
    // Usar ruta pública completamente nueva
    const response = await axios.post(`${BASE_URL}/public/mediciones/create`, medicion);
    
    return response;
  } catch (error) {
    console.error("Error al enviar la solicitud al backend:", error);
    throw error; 
  }
};

export const obtenerMedicionesPorPacienteRequest = async (id) => {
  // Usar ruta pública completamente nueva
  console.log("🔄 API: Solicitando mediciones para paciente ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/public/mediciones/patient/${id}`);
  
  const response = await axios.get(`${BASE_URL}/public/mediciones/patient/${id}`);
  
  console.log("✅ API: Respuesta recibida del backend:", response.data);
  return response;
}

export const actualizarMedicionRequest = async (id, medicion) => {
  // Usar ruta pública completamente nueva
  return await axios.put(`${BASE_URL}/public/mediciones/update/${id}`, medicion);
}

export const eliminarMedicionRequest = async (id) => {
  const token = localStorage.getItem("token");
  
  // Usar ruta pública completamente nueva
  return await axios.delete(`${BASE_URL}/public/mediciones/delete/${id}`);
}

// Api para resultados

export const crearResultadosRequest = async (datosTransformados) => {
  try {
    // Usar ruta pública completamente nueva
    const response = await axios.post(`${BASE_URL}/public/resultados/create`, datosTransformados);
    return response;
  } catch (error) {
    console.error("Error al crear resultados:", error);
    throw error;
  }
};

export const obtenerResultadosPorPacienteRequest = async (id) => {
  try {
    // Usar ruta pública completamente nueva
    const response = await axios.get(`${BASE_URL}/public/resultados/patient/${id}`);
    return response;
  } catch (error) {
    console.error("Error al obtener resultados por paciente:", error);
    throw error;
  }
};

// Api para registro de Logs

export const registrarLogRequest = async (logData) => {
  try {
    // Usar ruta pública completamente nueva
    const response = await fetch(`${BASE_URL}/public/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Respuesta del backend:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error al registrar el log:", error);
    throw error;
  }
};