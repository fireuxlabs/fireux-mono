import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import type { Pill as PillModel } from 'fireux-core/types/pill.model'
import { agentConfig } from './supporting'

/**
 * Hydrated Agent shape used by composables.
 * - `user` is always the source of avatar/display_name.
 * - `core` and `app` are the Firestore-backed profiles (when present).
 */
export interface Agent {
  user: Profile['user'] | null
  core: AgentProfile | null
  app: AgentAppProfile | null
}

/**
 * Card + domain shapes (mirrors Chef/Supplier/Professional)
 * - ProfileCore/App host the domain fields for delta-friendly overlays
 */
export namespace AgentCard {
  /** Pill shape */
  export interface Pill extends PillModel.Props {}

  /** Cell shape */
  export interface Cell extends Pill {
    id?: string
  }

  /** Full CORE profile surface */
  export interface ProfileCore extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    title?: string | null
    subtitle?: string | null
    tagline?: string | null
    badges?: string[]

    bio_short?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    website_url?: string | null
  }

  /** Tenant APP overlay (delta space) */
  export interface ProfileApp extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    title?: string | null
    subtitle?: string | null
    tagline?: string | null
    badges?: string[]

    bio_short?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    website_url?: string | null
  }
}

/**
 * Firestore-facing profile types
 * - Core profile == UI ProfileCore
 * - App profile == UI ProfileApp
 */
export type AgentProfile = AgentCard.ProfileCore
export type AgentCoreProfile = AgentCard.ProfileCore
export type AgentAppProfile = AgentCard.ProfileApp

export { agentConfig }
