// shared/api/client.ts
import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { encryptData, decryptData } from '../utils/crypto';


// Configuración base
const API_URL = (import.meta as any).env.VITE_API_URL || `${window.location.origin}/api`;



export const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token y cifrar request
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Cifrar el payload si es JSON y no es un FormData
        if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            try {
                const plaintext = JSON.stringify(config.data);
                const ciphertext = await encryptData(plaintext);
                config.data = { encrypted_data: ciphertext };
                config.headers['X-Encrypted-Payload'] = 'true';
            } catch (error) {
                console.error('Failed to encrypt request payload:', error);
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores y descifrar response
apiClient.interceptors.response.use(
    async (response) => {
        const isEncrypted = response.headers['x-encrypted-payload'] === 'true' || 
                            (response.data && response.data.encrypted_data);
        if (isEncrypted && response.data && response.data.encrypted_data) {
            try {
                const decryptedStr = await decryptData(response.data.encrypted_data);
                response.data = JSON.parse(decryptedStr);
            } catch (error) {
                console.error('Failed to decrypt response payload:', error);
            }
        }
        return response;
    },
    async (error: AxiosError) => {
        const response = error.response;
        if (response) {
            const isEncrypted = response.headers['x-encrypted-payload'] === 'true' || 
                                (response.data && (response.data as any).encrypted_data);
            if (isEncrypted && response.data && (response.data as any).encrypted_data) {
                try {
                    const decryptedStr = await decryptData((response.data as any).encrypted_data);
                    response.data = JSON.parse(decryptedStr);
                } catch (err) {
                    console.error('Failed to decrypt error response payload:', err);
                }
            }
        }

        const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('login');
        if (error.response?.status === 401 && !isLoginRequest) {
            // Token expirado o inválido (no redireccionar si es la petición de login)
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);