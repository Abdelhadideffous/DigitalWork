import axios from "axios"

const API_URL = "http://localhost:8000/api"

// Configuration de base d'Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interfaces pour les types de données
export interface RecentProject {
  id: number
  title: string
  description: string
  status_id: number
  priority_id: number
  progress: number
  start_date: string
  end_date: string
  status?: { id: number; name: string }
  priority?: { id: number; name: string }
  manager?: { id: number; name: string }
}

export interface RecentTask {
  id: number
  title: string
  description: string
  project_id: number
  status_id: number
  priority_id: number
  end_date: string
  status?: { id: number; name: string }
  priority?: { id: number; name: string }
  // Supprimer la référence directe à project qui n'existe pas
}

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface TeamPerformance {
  id: number
  team: string // Changer de 'name' à 'team'
  tasksCompleted: number
  tasksTotal: number
  progress: number
  onTime: string
  lead: string // Changer de 'manager' à 'lead'
}

export interface DashboardStats {
  activeProjects: number
  pendingTasks: number
  totalUsers: number
  delayedProjects: number
}

// Définir les fonctions API
export const dashboardApi = {
  getRecentProjects: async () => {
    try {
      const response = await apiClient.get("/projects")
      return response.data.data as RecentProject[]
    } catch (error) {
      console.error("Erreur lors de la récupération des projets récents:", error)
      throw error
    }
  },

  getUserTasks: async (userId: number) => {
    try {
      const response = await apiClient.get(`/users/${userId}/tasks`)
      return response.data.data as RecentTask[]
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches de l'utilisateur:", error)
      throw error
    }
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get("/users")
      return response.data.data as User[]
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error)
      throw error
    }
  },

  getTeamPerformance: async () => {
    try {
      const response = await apiClient.get("/dashboard/performance-summary")
      return response.data as TeamPerformance[]
    } catch (error) {
      console.error("Erreur lors de la récupération des performances des équipes:", error)
      throw error
    }
  },

  getStats: async () => {
    try {
      // Adaptez cette URL à votre endpoint réel pour les statistiques du tableau de bord
      const response = await apiClient.get("/dashboard/stats")
      return response.data as DashboardStats
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques du tableau de bord:", error)
      return {
        activeProjects: 0,
        pendingTasks: 0,
        totalUsers: 0,
        delayedProjects: 0,
      }
    }
  },

  getManagedProjects: async () => {
    try {
      const response = await apiClient.get("/projects/managed")
      return response.data.data as RecentProject[]
    } catch (error) {
      console.error("Erreur lors de la récupération des projets gérés:", error)
      throw error
    }
  },
}
