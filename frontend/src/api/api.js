import axios from 'axios';
import config from '../config.js';
import { hybridCache } from '../services/CacheService.js';

const { API_BASE_URL } = config;

// Configuración del interceptor de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar timestamp para cache busting si es necesario
    if (config.bustCache) {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - manejo de errores global
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    
    // Transformar error para mejor UX
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Error de conexión';
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Función helper para requests con cache
const cachedRequest = async (cacheKey, requestFn, cacheOptions = {}) => {
  try {
    // Intentar obtener del cache primero
    const cached = await hybridCache.get(cacheKey, cacheOptions);
    if (cached && !cacheOptions.bustCache) {
      console.log(`Cache hit for: ${cacheKey}`);
      return { data: cached };
    }
    
    // Si no hay cache o se debe actualizar, hacer request
    console.log(`Cache miss for: ${cacheKey}, fetching from API`);
    const response = await requestFn();
    
    // Guardar en cache si la respuesta es exitosa
    if (response.data) {
      await hybridCache.set(cacheKey, response.data, cacheOptions);
    }
    
    return response;
  } catch (error) {
    // En caso de error, intentar devolver cache stale si existe
    const staleCache = await hybridCache.get(cacheKey, { ...cacheOptions, useLocal: true });
    if (staleCache) {
      console.warn(`API error, returning stale cache for: ${cacheKey}`);
      return { data: staleCache, fromCache: true, stale: true };
    }
    throw error;
  }
};

// Apis para usuario
export const crearUsuarioRequest = async (usuario) => {
  return await api.post('/register', usuario);
};

export const loginUsuarioRequest = async ({ email, password }) => {
  // Limpiar cache al hacer login
  await hybridCache.clear();
  return await api.post('/login', { email, password });
};

export const obtenerUsuarioRequest = async (id, options = {}) => {
  const cacheKey = `user-${id}`;
  return await cachedRequest(
    cacheKey,
    () => api.get(`/usuario/${id}`),
    {
      useMemory: true,
      useLocal: true,
      memoryTTL: 5 * 60 * 1000, // 5 minutos
      localTTL: 30 * 60 * 1000, // 30 minutos
      ...options
    }
  );
};

// Apis para pacientes
export const obtenerPacientesRequest = async (userId, options = {}) => {
  const id = userId || localStorage.getItem("userId");
  const cacheKey = `patients-${id}`;
  return await cachedRequest(
    cacheKey,
    () => api.get(`/pacientes/${id}`),
    {
      useMemory: true,
      useLocal: true,
      memoryTTL: 3 * 60 * 1000, // 3 minutos
      localTTL: 15 * 60 * 1000, // 15 minutos
      ...options
    }
  );
};

export const crearPacienteRequest = async (paciente) => {
  const response = await api.post('/pacientes', paciente);
  
  // Invalidar cache de pacientes después de crear uno nuevo
  const userId = localStorage.getItem("userId");
  if (userId) {
    await hybridCache.delete(`patients-${userId}`);
  }
  
  return response;
};

export const actualizarPacienteRequest = async (id, paciente) => {
  const response = await api.put(`/pacientes/${id}`, paciente);
  
  // Invalidar cache relacionado
  const userId = localStorage.getItem("userId");
  if (userId) {
    await hybridCache.delete(`patients-${userId}`);
    await hybridCache.delete(`patient-${id}`);
  }
  
  return response;
};

export const eliminarPacienteRequest = async (id) => {
  const response = await api.delete(`/pacientes/${id}`);
  
  // Invalidar cache relacionado
  const userId = localStorage.getItem("userId");
  if (userId) {
    await hybridCache.delete(`patients-${userId}`);
    await hybridCache.delete(`patient-${id}`);
  }
  
  return response;
};

// Api para consultas
export const obtenerConsultasRequest = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/consultas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export const crearConsultaRequest = async (consulta) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_BASE_URL}/consultas`, consulta, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

// Api para mediciones
export const crearMedicionesRequest = async (medicion) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mediciones`, medicion, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  return await axios.get(`${API_BASE_URL}/mediciones/paciente/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Api para resultados
export const crearResultadosRequest = async (datosTransformados) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/resultados`, datosTransformados, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  return await axios.get(`${API_BASE_URL}/resultados/paciente/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Api para registro de Logs
export const registrarLogRequest = async (logData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/logs`, {
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