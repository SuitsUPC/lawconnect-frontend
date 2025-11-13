import axios from 'axios';

// URL base del API Gateway - debe estar definida en las variables de entorno
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Validación y logging en desarrollo
if (typeof window !== 'undefined' && !API_BASE_URL) {
  console.error('⚠️ NEXT_PUBLIC_API_URL no está definida. Verifica tu archivo .env.local');
}

if (typeof window !== 'undefined' && API_BASE_URL) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Si el body es FormData, no establecer Content-Type manualmente
    // axios lo manejará automáticamente con el boundary correcto
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, limpiar localStorage y redirigir al login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

