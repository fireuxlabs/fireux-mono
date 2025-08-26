// Firestore timestamp type
interface FirestoreTimestamp {
  type: string // "firestore/timestamp/1.0"
  seconds: number
  nanoseconds: number
}

export interface App {
  id: string
  app_name: string
  admin_ids: string[]
  creator_id: string // Required field for the creator
  is_tenant: boolean // Required field - defaults to true for tenant apps
  ecosystem?: string // Business ecosystem (e.g., 'misebox', 'cleanbox')
  created_at?: FirestoreTimestamp | string // Can be Firestore timestamp or string
  avatarUrl?: string
}

/**
 * App namespace for nested interfaces
 */
export namespace App {
  /**
   * Card components for different display sizes
   */
  export namespace Card {
    /**
     * Pill - For compact display components (icon, name, type)
     */
    export interface Pill {
      id: string
      app_name: string
      parent?: string
      avatarUrl?: string
    }

    /**
     * Cell - For medium display with badges and metadata
     */
    export interface Cell {
      id: string
      app_name: string
      admin_ids: string[]
      creator_id: string
      is_tenant: boolean
      parent?: string
      created_at?: FirestoreTimestamp | string
      avatarUrl?: string
    }

    /**
     * Profile - For comprehensive display with all details
     */
    export interface Profile {
      id: string
      app_name: string
      admin_ids: string[]
      creator_id: string
      is_tenant: boolean
      parent?: string
      created_at?: FirestoreTimestamp | string
      avatarUrl?: string
    }
  }
}
