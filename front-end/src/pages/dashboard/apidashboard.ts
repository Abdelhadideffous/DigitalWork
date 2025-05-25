import axios from "axios"

const API_URL = "http://localhost:8000/api"

// Création d'une instance axios avec une URL de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Ajout du token d'authentification à chaque requête
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers.Accept = "application/json"
  return config
})

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message || error)
    return Promise.reject(error)
  },
)

// Types pour le dashboard
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
}

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface TeamPerformance {
  id: number
  team: string
  tasksCompleted: number
  tasksTotal: number
  progress: number
  onTime: string
  lead: string
}

export const dashboardApi = {
  getRecentProjects: async (): Promise<RecentProject[]> => {
    const response = await api.get("/projects")
    return response.data.data
  },

  getManagedProjects: async (): Promise<RecentProject[]> => {
    const response = await api.get("/projects/managed")
    return response.data.data
  },

  getUserTasks: async (userId: number): Promise<RecentTask[]> => {
    // Cette route existe : /users/{id}/tasks
    const response = await api.get(`/users/${userId}/tasks`)
    return response.data.data
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get("/users")
    return response.data.data
  },

}

export default api
