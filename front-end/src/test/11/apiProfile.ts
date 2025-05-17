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

const getCurrentUser = () => {
  try {
    const user = sessionStorage.getItem("user")
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error("Error parsing user from sessionStorage:", error)
    return null
  }
}

export const profileApi = {
  // Récupérer les informations du profil
  getProfile: async () => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser || !currentUser.id) {
        throw new Error("Utilisateur non connecté ou ID non disponible")
      }
      const response = await apiClient.get(`/users/${currentUser.id}`)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      throw error
    }
  },

  // Mettre à jour les informations du profil
  updateProfile: async (userData: any) => {
    try {
      if (!userData.id) {
        throw new Error("ID utilisateur non disponible")
      }

      // Créer une copie des données sans le mot de passe vide
      const dataToUpdate = { ...userData }
      if (dataToUpdate.password === "") {
        delete dataToUpdate.password
      }

      const response = await apiClient.put(`/users/${userData.id}`, dataToUpdate)
      console.log("Réponse de l'API updateProfile:", response.data)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      throw error
    }
  },
}

export default profileApi