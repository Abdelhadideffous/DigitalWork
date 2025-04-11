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

// API pour les projets
export const projectApi = {
    getAllProjects: async () => {
        try {
            const response = await api.get('/projects');
            // Return only the data array from the response
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
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
