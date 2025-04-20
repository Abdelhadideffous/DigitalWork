import axios from 'axios';

// Définition des URLs de l'API
export const API_URLS = {
    BASE_URL: 'http://localhost:8000/api',
    AUTH: {
        LOGIN: '/login',
        LOGOUT: '/logout',
    },
    USERS: {
        ALL: '/users',
        BY_ID: (id: number) => `/users/${id}`,
    },
    PROJECTS: {
        ALL: '/projects',
        BY_ID: (id: number) => `/projects/${id}`,
    },
    TASKS: {
        ALL: '/tasks',
        BY_ID: (id: number) => `/tasks/${id}`,
        BY_PROJECT: (projectId: number) => `/projects/${projectId}/tasks`,
    },
    // Ajoutez d'autres endpoints selon vos besoins
};

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URLS.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Export the api instance for use in other services
export default api;
