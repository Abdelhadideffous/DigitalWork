import axios from 'axios';

// Création d'une instance axios avec une URL de base
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ajouter cet intercepteur après la création de l'instance api
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error.message || error);
        return Promise.reject(error);
    },
);

// Types pour l'authentification
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        role?: string; // Ajouter le rôle de l'utilisateur
    };
    message?: string;
}

// API pour l'authentification
export const authApi = {
    // Fonction pour se connecter
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            const response = await api.post('/login', credentials);
            return response.data;
        } catch (error: any) {
            console.error('Erreur de connexion:', error);

            // Si l'erreur a une réponse du serveur, on la retourne
            if (error.response && error.response.data) {
                return error.response.data;
            }

            // Sinon on retourne une erreur générique
            return {
                success: false,
                message: error.message || 'Erreur lors de la connexion',
            };
        }
    },

    // Fonction pour se déconnecter
    logout: async (token: string): Promise<boolean> => {
        try {
            const response = await api.post(
                '/logout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            return response.status === 204; // Le backend renvoie 204 No Content en cas de succès
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
            return false;
        }
    },
};

// Fonction pour ajouter le token d'authentification aux requêtes
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Fonction pour récupérer l'utilisateur connecté
export const getCurrentUser = () => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        return null;
    }
};

export default api;
