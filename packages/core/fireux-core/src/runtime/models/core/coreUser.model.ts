/**
 * Core User Model - Based on Existing Data
 *
 * Simple model that matches your current Firebase data structure
 * across FireUX and Misebox projects.
 */

import type { FirebaseTimestamp } from '../../types/firebase'

/**
 * Core User - Current Data Structure
 *
 * Matches what you actually have in Firebase right now
 */
export interface CoreUser {
  id: string
  email: string
  display_name?: string // For display purposes
  avatar: string
  userOf: string[] // ["fireux-app"] or ["misebox-app", "niederhorn"]
  adminOf: string[] // ["fireux-app"] or ["misebox-app", "niederhorn"]
  created_at: string | FirebaseTimestamp
  created_in?: string // Present in Misebox, missing in FireUX
  updated_at?: string // Present in Misebox, missing in FireUX
  dob?: string // Present in some Misebox users
  creator_id?: string // Present in some records
  appId?: string // Present in some records
}

/**
 * Core User namespace for nested interfaces
 */
export namespace CoreUser {
  /**
   * Card components for different display sizes
   */
  export namespace Card {
    /**
     * Pill - For small display components (just avatar and name)
     */
    export interface Pill {
      display_name?: string // Preferred display name
      email: string // Fallback if no display_name
      avatar: string
    }

    /**
     * Cell - For medium list item components
     */
    export interface Cell {
      id: string
      email: string
      display_name?: string
      avatar: string
      adminOf: string[] // For admin badge
      userOf: string[] // For app context
      created_at: string | FirebaseTimestamp
      created_in?: string
      dob?: string
    }

    /**
     * Profile - For full profile components
     */
    export interface Profile {
      id: string
      email: string
      display_name?: string
      avatar: string
      userOf: string[]
      adminOf: string[]
      created_at: string | FirebaseTimestamp
      created_in?: string
      updated_at?: string
      dob?: string
      creator_id?: string
      appId?: string
    }
  }
}
