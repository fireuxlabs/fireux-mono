
export interface CoreUser {
  id: string
  email: string
  avatar: string
  created_at: string
  updated_at: string
  userOf: string[] // Apps this user has joined as user
  adminOf: string[] // Apps this user has created/admins
  created_in: string // App where this core user was created
}