import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Configuration de base d'axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token à chaque requête
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
    }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
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

// Types pour les tâches - mise à jour pour correspondre au backend Laravel
export interface Task {
    id: number;
    title: string;
    description: string;
    project_id: number;
    status_id: number;
    priority_id: number;

    // Ajout des propriétés pour l'utilisateur assigné telles que renvoyées par le backend
    assigned_to: number;
    assigned_user?: {
        id: number;
        name: string;
        email: string;
    };

    // Garder user_id/user pour rétrocompatibilité
    user_id?: number;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };

    start_date: string;
    end_date: string;
    status?: { id: number; name: string };
    priority?: { id: number; name: string };
    project?: { id: number; title: string };
    progress?: number;
    created_at?: string;
    updated_at?: string;
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

// Interface pour les sous-tâches
export interface Subtask {
    id: number;
    task_id: number;
    title: string;
    status_id: number;
    progress: number;
    created_at?: string;
    updated_at?: string;
    status?: { id: number; name: string };
}

export interface NewSubtaskData {
    title: string;
    progress?: number;
}

// API pour les tâches
export const taskApi = {
    getAllTasks: async () => {
        try {
            const response = await api.get('/tasks');
            // Imprimer la réponse pour débogage
            console.log('Réponse API tâches:', response.data);
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
            throw error;
        }
    },

    // Récupérer une tâche par son ID
    getTaskById: async (id: number) => {
        try {
            const response = await api.get(`/tasks/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération de la tâche ${id}:`, error);
            throw error;
        }
    },

    // Créer une nouvelle tâche
    createTask: async (taskData: NewTaskData) => {
        try {
            // Adapter les données pour le backend qui attend assigned_to au lieu de user_id
            const response = await api.post('/tasks', {
                ...taskData,
                // Utiliser assigned_to pour le backend
                assigned_to: taskData.assigned_to,
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de la tâche:', error);
            throw error;
        }
    },

    // Mettre à jour une tâche
    updateTask: async (id: number, taskData: Partial<NewTaskData>) => {
        try {
            // Adapter les données pour le backend
            const response = await api.put(`/tasks/${id}`, {
                ...taskData,
                // Utiliser assigned_to pour le backend
                assigned_to: taskData.assigned_to,
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la tâche ${id}:`, error);
            throw error;
        }
    },

    // Supprimer une tâche
    deleteTask: async (id: number) => {
        try {
            const response = await api.delete(`/tasks/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression de la tâche ${id}:`, error);
            throw error;
        }
    },

    // Calculer la progression d'une tâche
    calculateProgress: async (id: number) => {
        try {
            const response = await api.post(`/tasks/${id}/calculate-progress`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors du calcul de la progression de la tâche ${id}:`, error);
            throw error;
        }
    },

    // Marquer une tâche comme terminée
    completeTask: async (id: number) => {
        try {
            const response = await api.post(`/tasks/${id}/terminer`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors du marquage de la tâche ${id} comme terminée:`, error);
            throw error;
        }
    },

    // Annuler une tâche
    cancelTask: async (id: number) => {
        try {
            const response = await api.post(`/tasks/${id}/annuler`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'annulation de la tâche ${id}:`, error);
            throw error;
        }
    },
};

// API pour les sous-tâches
export const subtaskApi = {
    // Récupérer toutes les sous-tâches d'une tâche
    getTaskSubtasks: async (taskId: number) => {
        try {
            const response = await api.get(`/tasks/${taskId}/subtasks`);
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des sous-tâches pour la tâche ${taskId}:`, error);
            throw error;
        }
    },

    // Créer une nouvelle sous-tâche
    createSubtask: async (taskId: number, subtaskData: NewSubtaskData) => {
        try {
            const response = await api.post(`/tasks/${taskId}/subtasks`, subtaskData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de la sous-tâche:', error);
            throw error;
        }
    },

    // Mettre à jour une sous-tâche
    updateSubtask: async (subtaskId: number, subtaskData: Partial<NewSubtaskData>) => {
        try {
            const response = await api.put(`/subtasks/${subtaskId}`, subtaskData);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la sous-tâche ${subtaskId}:`, error);
            throw error;
        }
    },

    // Supprimer une sous-tâche
    deleteSubtask: async (subtaskId: number) => {
        try {
            const response = await api.delete(`/subtasks/${subtaskId}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression de la sous-tâche ${subtaskId}:`, error);
            throw error;
        }
    },

    // Marquer une sous-tâche comme terminée
    completeSubtask: async (subtaskId: number) => {
        try {
            const response = await api.post(`/subtasks/${subtaskId}/complete`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors du marquage de la sous-tâche ${subtaskId} comme terminée:`, error);
            throw error;
        }
    },

    // Annuler une sous-tâche
    cancelSubtask: async (subtaskId: number) => {
        try {
            const response = await api.post(`/subtasks/${subtaskId}/cancel`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'annulation de la sous-tâche ${subtaskId}:`, error);
            throw error;
        }
    },
};

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
    getManagedProjects: async () => {
        const res = await api.get('/projects/managed');
        return res.data.data;
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

    // Récupérer les équipes d'un projet
    getProjectTeams: async (projectId: number) => {
        try {
            const response = await api.get(`/projects/${projectId}/teams`);
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des équipes du projet ${projectId}:`, error);
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

    getProjectMembers : async (projectId: number) => {
        try {
          const response = await api.get(`/projects/${projectId}/members`);
          return response.data.data || [];
        } catch (error) {
          console.error(`Erreur lors de la récupération des membres du projet ${projectId}:`, error);
          throw error;
        }
    },
};

export default api;