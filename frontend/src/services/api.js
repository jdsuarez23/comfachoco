/**
 * API Service Configuration
 * Axios instance with JWT token interceptor
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized - token expired or invalid
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/me')
};

// Solicitudes API
export const solicitudesAPI = {
    create: (solicitudData) => {
        // If solicitudData is FormData, don't set Content-Type (browser will set it with boundary)
        if (solicitudData instanceof FormData) {
            return api.post('/solicitudes', solicitudData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
        return api.post('/solicitudes', solicitudData);
    },
    getMySolicitudes: () => api.get('/solicitudes/mis-solicitudes'),
    getById: (id) => api.get(`/solicitudes/${id}`),
    getDetails: (id) => api.get(`/solicitudes/${id}/details`),
    downloadFile: (id) => api.get(`/solicitudes/${id}/download`, { responseType: 'blob' })
};

// RRHH API
export const rrhhAPI = {
    getSolicitudes: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return api.get(`/rrhh/solicitudes?${params}`);
    },
    aprobar: (id, data) => api.put(`/rrhh/solicitudes/${id}/aprobar`, data),
    rechazar: (id, data) => api.put(`/rrhh/solicitudes/${id}/rechazar`, data),
    getEstadisticas: () => api.get('/rrhh/estadisticas'),
    exportCSV: () => api.get('/rrhh/export-csv', { responseType: 'blob' })
};

export default api;
