import axios from 'axios';

// Création d'une instance axios avec une URL de base
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ajouter cette fonction au début du fichier après la création de l'instance api
// Assurez-vous que chaque requête inclut le token d'authentification
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

// Types pour les EDBs
export interface Edb {
    id: number;
    title: string;
    description: string;
    objectif: string;
    contrainte: string;
    user_id: number;
    status_id: number;
    priority_id: number;
    date_demande: string;
    status?: { id: number; name: string };
    priority?: { id: number; name: string };
    user?: { id: number; name: string };
    created_at?: string;
    updated_at?: string;
}

export interface NewEdbData {
    title: string;
    description: string;
    objectif: string;
    contrainte: string;
    user_id: number;
    priority_id: number;
    date_demande: string;
}

export interface Status {
    id: number;
    name: string;
}

export interface Priority {
    id: number;
    name: string;
}

export interface Attachment {
    id: number;
    edb_id: number;
    file_path: string;
    file_name: string;
    created_at?: string;
    updated_at?: string;
}

// API pour les EDBs
export const edbApi = {
    // Modifier la fonction getAllEdbs pour gérer les erreurs d'authentification
    getAllEdbs: async () => {
        try {
            // Récupérer le token manuellement pour s'assurer qu'il est utilisé
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vous devez être connecté pour accéder à cette ressource');
            }

            const response = await api.get('/all-edbs', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des EDBs:', error);
            throw error;
        }
    },

    // Récupérer un EDB par son ID
    getEdbById: async (id: number) => {
        try {
            const response = await api.get(`/edbs/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'EDB ${id}:`, error);
            throw error;
        }
    },

    // Créer un nouvel EDB
    createEdb: async (edbData: NewEdbData) => {
        try {
            const response = await api.post('/edbs', edbData);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de l'EDB:", error);
            throw error;
        }
    },

    // Mettre à jour un EDB
    updateEdb: async (id: number, edbData: Partial<NewEdbData>) => {
        try {
            const response = await api.put(`/edbs/${id}`, edbData);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'EDB ${id}:`, error);
            throw error;
        }
    },

    // Supprimer un EDB
    deleteEdb: async (id: number) => {
        try {
            const response = await api.delete(`/edbs/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'EDB ${id}:`, error);
            throw error;
        }
    },

    // Approuver un EDB
    approveEdb: async (id: number) => {
        try {
            const response = await api.patch(`/edbs/${id}/approve`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'approbation de l'EDB ${id}:`, error);
            throw error;
        }
    },

    // Rejeter un EDB
    rejectEdb: async (id: number) => {
        try {
            const response = await api.patch(`/edbs/${id}/reject`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors du rejet de l'EDB ${id}:`, error);
            throw error;
        }
    },

    // Récupérer tous les statuts
    getAllStatuses: async () => {
        try {
            const response = await api.get('/statuses');
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statuts:', error);
            throw error;
        }
    },

    // Récupérer toutes les priorités
    getAllPriorities: async () => {
        try {
            const response = await api.get('/priorities');
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des priorités:', error);
            throw error;
        }
    },

    // Récupérer les pièces jointes d'un EDB
    getEdbAttachments: async (edbId: number) => {
        try {
            const response = await api.get(`/edbs/${edbId}/attachments`);
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des pièces jointes de l'EDB ${edbId}:`, error);
            throw error;
        }
    },

    // Ajouter des pièces jointes à un EDB
    uploadAttachments: async (edbId: number, files: File[]) => {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files[]', file);
            });

            const response = await api.post(`/edbs/${edbId}/attachments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'ajout des pièces jointes à l'EDB ${edbId}:`, error);
            throw error;
        }
    },

    // Supprimer une pièce jointe
    deleteAttachment: async (edbId: number, attachmentId: number) => {
        try {
            const response = await api.delete(`/edbs/${edbId}/attachments/${attachmentId}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression de la pièce jointe ${attachmentId}:`, error);
            throw error;
        }
    },
};

export default api;
