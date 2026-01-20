import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para logging en desarrollo
api.interceptors.request.use(
  config => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  error => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('[API] Response error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 429) {
        throw new Error('Demasiadas peticiones. Por favor, espera un momento.');
      }
      
      if (status === 500) {
        throw new Error(data.message || 'Error del servidor. Intenta nuevamente.');
      }
      
      throw new Error(data.message || 'Error al procesar la solicitud');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      throw new Error('Error desconocido. Intenta nuevamente.');
    }
  }
);

export const chatAPI = {
  async sendMessage(messages, config) {
    const response = await api.post('/chat', { messages, config });
    return response.data;
  },

  async getModels() {
    const response = await api.get('/models');
    return response.data.models;
  },

  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
