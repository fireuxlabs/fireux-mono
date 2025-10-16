/** DX-friendly union for Firestore timestamps or ISO strings */
export interface FirestoreTimestamp {
  type: 'firestore/timestamp/1.0'
  seconds: number
  nanoseconds: number
}
type TSOrISO = FirestoreTimestamp | string

/** App scope role */
export type AppRole = 'global' | 'tenant' | 'sandbox'

/** Branding */
export interface AppBrand {
  primary?: string
  neutral?: string
  icon?: string
  logo_url?: string | null
}

/** Ecosystem-wide defaults (only on the global hub doc) */
export interface AppDefaults {
  brand?: AppBrand
  features?: Record<string, boolean>
  domain?: string
}

/**
 * Canonical App document
 * Collection: apps/{appId}
 * - Global hub (role='global') may include `defaults`
 * - Tenant (role='tenant') can set `brand`/`domain` overrides
 */
export interface AppDoc {
  /** == Firestore doc id */
  id: string

  /** Display name */
  app_name: string

  /** Short name (only for global/tenant apps) */
  app_short_name?: string

  /** Scope + lineage */
  role: AppRole
  ecosystem: string

  /** Tenant overrides (optional) */
  brand?: AppBrand
  domain?: string

  /** Only on global hub (apps/{ecosystem}-app) */
  defaults?: AppDefaults

  /** Governance */
  admin_ids?: string[]
  creator_id: string
  is_active?: boolean

  /** System metadata */
  created_at?: TSOrISO
  updated_at?: TSOrISO

  /** Media */
  avatar_url?: string | null

  /** Billing (optional) */
  billing?: {
    stripe_customer_id?: string
    plan?: 'basic' | 'standard' | 'pro' | 'full'
  }
}

/* ---------------------------
 * UI Card View Models (strict)
 * --------------------------- */
export namespace AppCard {
  export interface Pill {
    id: string
    app_name: string
    avatar_url?: string | null
  }

  export interface Cell {
    id: string
    app_name: string
    role: AppRole
    admin_ids?: string[]
    creator_id: string
    created_at?: TSOrISO
    avatar_url?: string | null
  }

  export interface Profile {
    id: string
    app_name: string
    role: AppRole
    admin_ids?: string[]
    creator_id: string
    created_at?: TSOrISO
    avatar_url?: string | null
    brand?: AppBrand
    domain?: string
  }
}
