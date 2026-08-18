import axios from 'axios';

// Configuración global de Axios para interactuar con DRF usando Cookies HttpOnly
// El backend debe configurarse para enviar el JWT en cookies (ej. dj-rest-auth o simplejwt adaptado)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // Crucial para enviar y recibir cookies (JWT HttpOnly)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
