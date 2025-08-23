export interface App {
  id: string
  app_name: string
  admin_ids: string[]
  parent?: string // Parent system (e.g., 'misebox', 'cleanbox', 'fireux')
  is_tenant?: boolean // Flag to identify if this is a tenant app (vs platform app) - defaults to true since most apps will be tenants
  created_at?: string
  creator_id?: string // Changed from created_by to match other objects
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
      parent?: string
      is_tenant?: boolean
      admin_ids: string[]
      created_at?: string
      creator_id?: string
      avatarUrl?: string
    }

    /**
     * Profile - For comprehensive display with all details
     */
    export interface Profile {
      id: string
      app_name: string
      admin_ids: string[]
      parent?: string
      is_tenant?: boolean
      created_at?: string
      creator_id?: string
      avatarUrl?: string
    }
  }
}
