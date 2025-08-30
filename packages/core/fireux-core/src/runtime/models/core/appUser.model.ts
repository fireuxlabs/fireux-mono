/**
 * App User Model - Based on Existing Data
 *
 * Simple model that matches your current app-specific user data.
 * App Users are domain-specific profiles that extend Core User identity.
 */

import type { FirebaseTimestamp } from '../../types/firebase'

/**
 * Subscription Information
 */
export interface SubscriptionInfo {
  plan?: string
  status?:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'unpaid'
    | 'inactive'
    | 'cancelled'
  tier?: string
  currentPeriodEnd?: number // epoch seconds
  features?: string[]
  is_pro?: boolean
  ends_at?: string | Date
  stripe_customer_id?: string
}

/**
 * App User - Current Data Structure
 *
 * App-specific user profiles (jobs, misebox, etc.)
 */
export interface AppUser {
  id: string
  uid: string
  email: string
  avatar: string
  display_name: string
  handle?: string
  slug?: string // URL-friendly identifier
  bio?: string
  created_at: string | FirebaseTimestamp
  updated_at?: string | FirebaseTimestamp
  role?: 'user' | 'admin'
  subscription?: SubscriptionInfo

  // Basic profile info
  first_name?: string
  last_name?: string
  phone?: string

  // Address (if used by app)
  address?: {
    city?: string
    state?: string
    country?: string
  }

  // Preferences
  preferences?: {
    theme?: 'light' | 'dark'
    language?: string
  }

  /**
   * Profiles array: tracks all profile types (chef, supplier, etc) for this user in this app
   */
  profiles?: Array<{
    type: string
    collection: string
    created_at: string
    is_active: boolean
  }>
}

/**
 * App User namespace for nested interfaces
 */
export namespace AppUser {
  /**
   * Card components for different display sizes
   */
  export namespace Card {
    /**
     * Pill - For small display components (just avatar and name)
     */
    export interface Pill {
      display_name: string
      avatar: string
    }
  }
}

/**
 * Author - Simplified author info for content
 */
export interface Author {
  id: string
  display_name: string
  handle?: string
  avatar: string
  slug?: string
}
