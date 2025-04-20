import api from "./api"
import type { AxiosResponse } from "axios"

export interface User {
  id: number
  name: string
  email: string
}

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response: AxiosResponse = await api.get("/users")
      return response.data.data
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    try {
      const response: AxiosResponse = await api.get(`/users/${id}`)
      return response.data.data
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },

  // Create a new user
  createUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const response: AxiosResponse = await api.post("/users", userData)
      return response.data.data
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  },

  // Update a user
  updateUser: async (id: number, userData: Partial<User>): Promise<void> => {
    try {
      await api.put(`/users/${id}`, userData)
    } catch (error) {
      console.error(`Error updating user ${id}:`, error)
      throw error
    }
  },

  // Delete a user
  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`)
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  },
}
