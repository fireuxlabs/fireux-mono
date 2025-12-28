import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import { agentConfig } from './supporting'

/**
 * Hydrated Agent shape used by composables.
 * - `user` is the canonical user surface (avatar / display_name).
 * - `core` is the global Agent profile document.
 * - `app` is the optional tenant overlay document.
 */
export interface Agent {
  user: Profile['user'] | null
  core: AgentProfile | null
  app: AgentAppProfile | null
}

/**
 * Agent domain shapes
 * Shape-only, no UI concerns.
 */
export namespace Agent {
  /**
   * Core Agent profile (global truth)
   * Firestore: agents/{uid}
   */
  export interface ProfileCore extends Profile {
    title?: string | null
    subtitle?: string | null
    tagline?: string | null
    badges?: string[]

    bio_short?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    website_url?: string | null
  }

  /**
   * Tenant Agent overlay (delta-only)
   * Firestore: apps/{appId}/agents/{uid}
   *
   * Intentionally empty for now.
   * Add fields only when a true tenant-specific delta is required.
   */
  export interface ProfileApp extends Profile {}
}

/**
 * Firestore-facing aliases
 */
export type AgentProfile = Agent.ProfileCore
export type AgentCoreProfile = Agent.ProfileCore
export type AgentAppProfile = Agent.ProfileApp

export { agentConfig }
