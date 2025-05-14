import axios from 'axios';

// Création d'une instance axios avec une URL de base
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error.message || error);
        return Promise.reject(error);
    },
);

// Types pour les projets
export interface Project {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status_id: number;
    priority_id: number;
    status?: { id: number; name: string };
    priority?: { id: number; name: string };
    progress?: number;
    created_at?: string;
    updated_at?: string;
}

export interface NewProjectData {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status_id: number;
    priority_id: number;
}

export interface Status {
    id: number;
    name: string;
}

export interface Priority {
    id: number;
    name: string;
}

// Mise à jour de l'interface User pour inclure toutes les propriétés possibles
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

export interface NewTaskData {
    title: string;
    description: string;
    project_id: number;
    status_id: number;
    priority_id: number;
    assigned_to: number; // Mise à jour pour utiliser assigned_to au lieu de user_id
    start_date: string;
    end_date: string;
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Accept = 'application/json';
    return config;
});

// API pour les projets
export const projectApi = {
    getAllProjects: async () => {
        try {
            const response = await api.get('/projects');
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            throw error;
        }
    },

    // Récupérer un projet par son ID
    getProjectById: async (id: number) => {
        try {
            const response = await api.get(`/projects/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération du projet ${id}:`, error);
            throw error;
        }
    },

    // Créer un nouveau projet
    createProject: async (projectData: NewProjectData) => {
        try {
            const response = await api.post('/projects', projectData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du projet:', error);
            throw error;
        }
    },

    // Mettre à jour un projet
    updateProject: async (id: number, projectData: Partial<NewProjectData>) => {
        try {
            const response = await api.put(`/projects/${id}`, projectData);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
            throw error;
        }
    },

    // Supprimer un projet
    deleteProject: async (id: number) => {
        try {
            const response = await api.delete(`/projects/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression du projet ${id}:`, error);
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

    getAvailableProjects: async () => {
        try {
            const response = await api.get('/available-projects');
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des projets disponibles:', error);
            throw error;
        }
    },
};

// API pour les équipes
export const teamApi = {
    getAllTeams: async () => {
        try {
            const response = await api.get('/teams');
            // Return only the data array from the response
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des équipes:', error);
            throw error;
        }
    },

    // Récupérer une équipe par son ID
    getTeamById: async (id: number) => {
        try {
            const response = await api.get(`/teams/${id}`);
            // Return only the data object from the response
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'équipe ${id}:`, error);
            throw error;
        }
    },

    // Créer une nouvelle équipe
    createTeam: async (teamData: { name: string; leaderId: number; description: string; projectId: number }) => {
        try {
            const response = await api.post('/teams', {
                name: teamData.name,
                manager_id: teamData.leaderId,
                description: teamData.description,
                project_id: teamData.projectId,
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de l'équipe:", error);
            throw error;
        }
    },

    // Mettre à jour une équipe
    updateTeam: async (
        id: number,
        teamData: {
            name: string;
            leaderId: number;
            description: string;
            projectId?: number;
        },
    ) => {
        try {
            const data: any = {
                name: teamData.name,
                manager_id: teamData.leaderId,
                description: teamData.description,
            };

            if (teamData.projectId) {
                data.project_id = teamData.projectId;
            }

            const response = await api.put(`/teams/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'équipe ${id}:`, error);
            throw error;
        }
    },

    // Supprimer une équipe
    deleteTeam: async (id: number) => {
        try {
            const response = await api.delete(`/teams/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'équipe ${id}:`, error);
            throw error;
        }
    },

    // Ajouter un membre à une équipe
    addMember: async (teamId: number, userId: number) => {
        try {
            const response = await api.post(`/teams/${teamId}/members`, {
                user_id: userId,
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'ajout du membre à l'équipe ${teamId}:`, error);
            throw error;
        }
    },

    // Ajouter plusieurs membres à une équipe
    addMultipleMembers: async (teamId: number, userIds: number[]) => {
        try {
            // Utilisation de Promise.all pour effectuer plusieurs requêtes en parallèle
            const promises = userIds.map((userId) => api.post(`/teams/${teamId}/members`, { user_id: userId }));
            const responses = await Promise.all(promises);
            return responses.map((response) => response.data);
        } catch (error) {
            console.error(`Erreur lors de l'ajout des membres à l'équipe ${teamId}:`, error);
            throw error;
        }
    },

    // Supprimer un membre d'une équipe
    removeMember: async (teamId: number, userId: number) => {
        try {
            const response = await api.delete(`/teams/${teamId}/members/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression du membre de l'équipe ${teamId}:`, error);
            throw error;
        }
    },
};

// API pour les utilisateurs (pour récupérer la liste des utilisateurs disponibles)
export const userApi = {
    getAllUsers: async () => {
        try {
            console.log('Récupération de tous les utilisateurs...');
            const response = await api.get('/users');
            console.log('Utilisateurs récupérés avec succès:', response.data);
            // Return only the data array from the response
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    },
};

export default api;
