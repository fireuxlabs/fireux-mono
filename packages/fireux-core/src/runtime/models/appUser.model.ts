// App-specific user profile interface
export interface AppUser {
  uid: string // Explicitly store the UID for convenience
  first_name: string
  middle_name?: string // Optional middle name
  last_name: string
  display_name: string // Preferred display name (could be nickname)
  handle: string
  avatar: string // Avatar URL
  bio: string
  created_at: string
  email: string
  phone?: string // Optional phone number
  role?: 'user' | 'admin'

  // Address information
  address?: {
    city?: string
    state?: string
    country?: string
  }

  // Subscription system - managed by Stripe webhooks
  subscription?: {
    stripe_customer_id?: string
    stripe_subscription_id?: string
    plan: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'inactive' | 'cancelled' | 'past_due'
    started_at: string
    ends_at?: string
    is_pro: boolean // Computed from plan/status for easy access
  } | null

  // User preferences and social features
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
