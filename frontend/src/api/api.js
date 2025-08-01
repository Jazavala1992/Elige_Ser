import axios from 'axios';

// Configuración de URL base según el entorno
const BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:4000' 
  : 'https://elige-ser-backend.onrender.com';

console.log("Modo actual:", import.meta.env.MODE);
console.log("URL base configurada:", BASE_URL);

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
  
  // Usar endpoint temporal sin autenticación
  if (id === "1" || id === 1) {
    return await axios.get(`${BASE_URL}/usuario-temp/1`);
  }
  
  return await axios.get(`${BASE_URL}/usuario/${id}`, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  });
};

// Apis para pacientes
export const obtenerPacientesRequest = async () => {
  const id = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/pacientes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export const crearPacienteRequest = async (paciente) => {
  const token = localStorage.getItem("token");
  console.log("Enviando paciente a:", `${BASE_URL}/pacientes`);
  console.log("Con datos:", paciente);
  console.log("Con token:", token);
  
  const response = await axios.post(`${BASE_URL}/pacientes`, paciente, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export const editPacienteRequest = async (id, paciente) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${BASE_URL}/pacientes/${id}`, paciente, {
      headers: {
        Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${BASE_URL}/pacientes/${id}`, {
    headers: {  
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}


// Api para consultas

export const obtenerConsultasRequest = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/consultas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}
export const crearConsultaRequest = async (consulta) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${BASE_URL}/consultas`, consulta, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

// Api para mediciones

export const crearMedicionesRequest = async (medicion) => {
  try {
    const response = await axios.post(`${BASE_URL}/mediciones`, medicion, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Asegúrate de que el token esté almacenado
      },
    });
    
    return response;
  } catch (error) {
    console.error("Error al enviar la solicitud al backend:", error);
    throw error; 
  }
};

export const obtenerMedicionesPorPacienteRequest = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.get(`${BASE_URL}/mediciones/paciente/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Api para resultados

export const crearResultadosRequest = async (datosTransformados) => {
  try {
    const response = await axios.post(`${BASE_URL}/resultados`, datosTransformados, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Asegúrate de que el token esté almacenado
      },
    });
    return response;
  } catch (error) {
    console.error("Error al crear resultados:", error);
    throw error;
  }
};

export const obtenerResultadosPorPacienteRequest = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.get(`${BASE_URL}/resultados/paciente/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Api para registro de Logs

export const registrarLogRequest = async (logData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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