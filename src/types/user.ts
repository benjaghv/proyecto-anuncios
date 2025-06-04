export interface User {
  id: string
  email: string
  name: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserWithPassword extends User {
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name: string
} 