import axios, { type AxiosError, type AxiosResponse } from "axios"

// Types pour les réponses API
interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// Type pour les utilisateurs
interface UserData {
  id?: number
  name: string
  email: string
  role: string
  number: string | null
  password?: string
}

// Type pour les erreurs formatées
interface FormattedError {
  message: string
  status?: number
  data?: any
}

// Configuration de base d'Axios avec l'URL correcte
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token d'authentification à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les réponses et les erreurs
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    console.error("Erreur API:", error)

    // Formater l'erreur pour une gestion cohérente
    const formattedError: FormattedError = {
      message: error.response?.data?.message || "Une erreur est survenue",
      status: error.response?.status,
      data: error.response?.data,
    }

    return Promise.reject(formattedError)
  },
)

// Service pour les utilisateurs
export const userService = {
  // Créer un nouvel utilisateur
  createUser: async (userData: UserData): Promise<ApiResponse<UserData>> => {
    try {
      console.log("Création d'utilisateur avec les données:", userData)
      const response = await apiClient.post<ApiResponse<UserData>>("/users", userData)
      console.log("Réponse de création d'utilisateur:", response.data)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error)
      throw error
    }
  },

  // Récupérer tous les utilisateurs
  getAllUsers: async (): Promise<ApiResponse<UserData[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserData[]>>("/users")
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error)
      throw error
    }
  },

  // Récupérer un utilisateur par son ID
  getUserById: async (id: number): Promise<ApiResponse<UserData>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserData>>(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error)
      throw error
    }
  },

  // Mettre à jour un utilisateur
  updateUser: async (id: number, userData: Partial<UserData>): Promise<ApiResponse<UserData>> => {
    try {
      // Créer une copie des données sans le mot de passe vide
      const dataToUpdate = { ...userData }
      if (dataToUpdate.password === "") {
        delete dataToUpdate.password
      }
      
      console.log(`Mise à jour de l'utilisateur ${id} avec les données:`, dataToUpdate)
      const response = await apiClient.put<ApiResponse<UserData>>(`/users/${id}`, dataToUpdate)
      console.log(`Réponse de mise à jour de l'utilisateur ${id}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error)
      throw error
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete<ApiResponse>(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error)
      throw error
    }
  },
}

// Fonction pour obtenir l'utilisateur actuel depuis le sessionStorage
export const getCurrentUser = (): UserData | null => {
  try {
    const userStr = sessionStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return null
  }
}

export default {
  user: userService,
  getCurrentUser,
}