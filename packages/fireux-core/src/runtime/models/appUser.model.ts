// ~/models/user.model.ts

// Core user identity (global, never app-specific)

// App-specific user profile (e.g., for FIReUX)
export interface AppUser {
  uid: string // ✅ Explicitly store the UID for convenience
  display_name: string
  handle: string
  avatar: string
  bio: string
  created_at: string
  email: string
  role?: 'user' | 'admin'

  // Subscription system - managed by Stripe webhooks
  subscription?: {
    stripe_customer_id?: string
    stripe_subscription_id?: string
    plan: 'free' | 'pro' | 'premium'
    status: 'active' | 'inactive' | 'cancelled' | 'past_due'
    started_at: string
    ends_at?: string
    is_pro: boolean // Computed from plan/status for easy access
  } | null

  // New properties for notifications, follows, and preferences
  notifications?: {
    enabled: boolean
    types: Array<'email' | 'push' | 'sms'>
  }
  followers?: Array<string> // List of user IDs following this user
  following?: Array<string> // List of user IDs this user is following
  preferences?: {
    theme: 'light' | 'dark'
    language: string
  }
}

export interface Author {
  display_name: string
  handle: string
  avatar: string
  id: string
}
