import axios from 'axios';

// Configuración de URL base según el entorno
const BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:4000/api' 
  : 'https://elige-ser-backend.onrender.com/api';

console.log("Modo actual:", import.meta.env.MODE);
console.log("URL base configurada:", BASE_URL);
console.log("🔄 API v4.0 - Usando rutas correctas del backend");

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
  
  return await axios.get(`${BASE_URL}/usuario/${id}`);
};

// Apis para pacientes
export const obtenerPacientesRequest = async () => {
  const id = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  
  console.log("🚀 API: Solicitando pacientes para usuario ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/pacientes/${id}`);
  console.log("🔑 API: Token disponible:", token ? "SÍ" : "NO");
  console.log("🌍 API: Modo ambiente:", import.meta.env.MODE);
  console.log("🏠 API: BASE_URL:", BASE_URL);
  
  if (!token) {
    console.error("❌ API: No hay token en localStorage");
    throw new Error("No hay token de autenticación");
  }
  
  if (!id) {
    console.error("❌ API: No hay userId en localStorage");
    throw new Error("No hay ID de usuario");
  }
  
  return await axios.get(`${BASE_URL}/pacientes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export const obtenerPacientePorIdRequest = async (idPaciente) => {
  const token = localStorage.getItem("token");
  
  console.log("🚀 API: Solicitando paciente con ID:", idPaciente);
  console.log("🔗 API: URL completa:", `${BASE_URL}/paciente/${idPaciente}`);
  console.log("🔑 API: Token:", token ? "Presente" : "No encontrado");
  
  return await axios.get(`${BASE_URL}/paciente/${idPaciente}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export const crearPacienteRequest = async (paciente) => {
  const token = localStorage.getItem("token");
  console.log("🚀 API: Creando paciente");
  console.log("🔗 API: URL completa:", `${BASE_URL}/pacientes`);
  console.log("Con datos:", paciente);
  
  return await axios.post(`${BASE_URL}/pacientes`, paciente, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export const editPacienteRequest = async (id, paciente) => {
  try {
    const token = localStorage.getItem("token");
    console.log("🚀 API: Editando paciente ID:", id);
    console.log("🔗 API: URL completa:", `${BASE_URL}/pacientes/${id}`);
    
    return await axios.put(`${BASE_URL}/pacientes/${id}`, paciente, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
  } catch (error) {
    console.error("Error en editPacienteRequest:", error);
    throw error;
  }
};

export const eliminarPacienteRequest = async (id) => { 
  const token = localStorage.getItem("token");
  console.log("🚀 API: Eliminando paciente ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/pacientes/${id}`);
  
  return await axios.delete(`${BASE_URL}/pacientes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}


// Api para consultas
export const obtenerConsultasRequest = async (id) => {
  const token = localStorage.getItem("token");
  console.log("🚀 API: Solicitando consultas para ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/consultas/${id}`);
  
  return await axios.get(`${BASE_URL}/consultas/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export const crearConsultaRequest = async (consulta) => {
  const token = localStorage.getItem("token");
  console.log("🚀 API: Creando consulta");
  console.log("🔗 API: URL completa:", `${BASE_URL}/consultas`);
  
  return await axios.post(`${BASE_URL}/consultas`, consulta, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export const eliminarConsultaRequest = async (id) => {
  const token = localStorage.getItem("token");
  console.log("🚀 API: Eliminando consulta ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/consultas/${id}`);
  
  return await axios.delete(`${BASE_URL}/consultas/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Api para mediciones
export const crearMedicionesRequest = async (medicion) => {
  try {
    const token = localStorage.getItem("token");
    return await axios.post(`${BASE_URL}/mediciones`, medicion, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Error al enviar la solicitud al backend:", error);
    throw error; 
  }
};

export const obtenerMedicionesPorPacienteRequest = async (id) => {
  const token = localStorage.getItem("token");
  console.log("🔄 API: Solicitando mediciones para paciente ID:", id);
  console.log("🔗 API: URL completa:", `${BASE_URL}/mediciones/paciente/${id}`);
  
  const response = await axios.get(`${BASE_URL}/mediciones/paciente/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log("✅ API: Respuesta recibida del backend:", response.data);
  return response;
}

export const actualizarMedicionRequest = async (id, medicion) => {
  const token = localStorage.getItem("token");
  return await axios.put(`${BASE_URL}/mediciones/${id}`, medicion, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export const eliminarMedicionRequest = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.delete(`${BASE_URL}/mediciones/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Api para resultados

// Api para resultados
export const crearResultadoRequest = async (resultado) => {
  const token = localStorage.getItem("token");
  return await axios.post(`${BASE_URL}/resultados`, resultado, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const obtenerTodosResultadosRequest = async () => {
  const token = localStorage.getItem("token");
  return await axios.get(`${BASE_URL}/resultados`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const obtenerResultadoPorIdRequest = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.get(`${BASE_URL}/resultados/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const obtenerResultadosPorPacienteRequest = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.get(`${BASE_URL}/resultados/paciente/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const actualizarResultadoRequest = async (id, resultado) => {
  const token = localStorage.getItem("token");
  return await axios.put(`${BASE_URL}/resultados/${id}`, resultado, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const eliminarResultadoRequest = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.delete(`${BASE_URL}/resultados/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Api para registro de Logs

export const registrarLogRequest = async (logData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
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