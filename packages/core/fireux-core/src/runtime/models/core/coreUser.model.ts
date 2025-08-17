export interface CoreUser {
  id: string
  email: string
  avatar: string
  created_at: string
  updated_at: string
  userOf: string[] // Apps this user has joined
  adminOf: string[] // Apps this user admins
  created_in: string // App where this core user was created

  // Global profiles (shared across all apps) - simplified to just strings
  profiles?: Array<string> // ['chef', 'supplier', 'professional', 'employer']

  // Global subscription (works across all apps) - minimal
  subscription?: {
    plan: 'free' | 'pro'
    status: 'active' | 'inactive'
    started_at: string
    is_pro: boolean
  }
}
