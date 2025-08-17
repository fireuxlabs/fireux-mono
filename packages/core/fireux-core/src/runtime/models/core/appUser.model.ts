// App-specific user profile interface - super lean
export interface AppUser {
  uid: string // References CoreUser.id
  role?: 'user' | 'admin' // User's role in this specific app
  display_name: string // App-specific display name
  created_at?: string // When the user joined this app

  // App-specific customization (optional)
  handle?: string // App-specific handle (@username)
  bio?: string // App-specific bio
  avatar?: string // App-specific avatar (overrides CoreUser avatar)

  // App-specific notifications
  notifications?: {
    enabled: boolean
    types: Array<'email' | 'push'>
  }
}

export interface Author {
  display_name: string
  handle: string
  avatar: string
  slug: string
  id: string
}
