export interface LoginRequest {
    email: string
    password: string
  }
  
  export interface LoginResponse {
    success: boolean
    token?: string
    user?: {
      id: number
      name: string
      email: string
    }
    error?: string
  }
  