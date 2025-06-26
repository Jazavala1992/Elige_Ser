import axios from 'axios';

// Apis para usuario
export const crearUsuarioRequest = async (usuario) => {
  return await axios.post('http://localhost:4000/register', usuario);
};

export const loginUsuarioRequest = async ({ email, password }) => {
  return await axios.post('http://localhost:4000/login', { email, password });
};


const token = localStorage.getItem("token"); 
export const obtenerUsuarioRequest = async (id) => {
  const token = localStorage.getItem("token");
  console.log("Token enviado:", token);
  return await axios.get(`http://localhost:4000/usuario/${id}`, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  });
};

// Apis para pacientes
export const obtenerPacientesRequest = async () => {
  const id = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const response = await axios.get(`http://localhost:4000/pacientes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export const crearPacienteRequest = async (paciente) => {
  const token = localStorage.getItem("token");
  const response = await axios.post('http://localhost:4000/pacientes', paciente, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export const editPacienteRequest = async (id, paciente) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`http://localhost:4000/pacientes/${id}`, paciente, {
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
  const response = await axios.delete(`http://localhost:4000/pacientes/${id}`, {
    headers: {  
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}


// Api para consultas

export const obtenerConsultasRequest = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`http://localhost:4000/consultas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}
export const crearConsultaRequest = async (consulta) => {
  const response = await axios.post('http://localhost:4000/consultas', consulta, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

// Api para mediciones

export const crearMedicionesRequest = async (medicion) => {
  try {
    const response = await axios.post("http://localhost:4000/mediciones", medicion, {
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
  return await axios.get(`http://localhost:4000/mediciones/paciente/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Api para resultados

export const crearResultadosRequest = async (datosTransformados) => {
  try {
    const response = await axios.post("http://localhost:4000/resultados", datosTransformados, {
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
  return await axios.get(`http://localhost:4000/resultados/paciente/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Api para registro de Logs

export const registrarLogRequest = async (logData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:4000/api/logs", {
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