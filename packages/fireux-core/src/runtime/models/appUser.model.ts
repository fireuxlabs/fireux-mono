// ~/models/user.model.ts

// Core user identity (global, never app-specific)

// App-specific user profile (e.g., for FIReUX)
export interface AppUserProfile {
  uid: string // ✅ Explicitly store the UID for convenience
  display_name: string
  handle: string
  avatar: string
  bio: string
  created_at: string
  email: string
  role?: 'user' | 'admin'
  subscription?: {
    plan: 'standard' | 'premium'
    started_at: string
  } | null
}

export interface Author {
  display_name: string
  handle: string
  avatar: string
  id: string
}
