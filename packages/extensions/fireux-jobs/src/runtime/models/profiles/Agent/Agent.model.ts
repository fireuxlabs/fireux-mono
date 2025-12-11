import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import { agentConfig } from './supporting'

/**
 * Hydrated Agent shape used by composables.
 * - `user` is always the source of avatar/display_name.
 * - `core` and `app` are the Firestore-backed profiles (when present).
 */
export interface Agent {
  user: Profile['user'] | null
  core: AgentCoreProfile | null
  app: AgentAppProfile | null
}

/**
 * Core Agent profile
 * - Global, ecosystem-wide
 * - One per user, regardless of app
 */
export interface AgentCoreProfile extends Profile {
  /** user id, same as profile id */
  id: string

  /** required profile timestamps */
  created_at: Profile['created_at']
  updated_at: Profile['updated_at']

  /**
   * Global Agent fields
   * (safe to expand later as the domain grows)
   */
  tagline?: string | null
}

/**
 * App Agent profile
 * - Tenant-specific object
 * - One per (appId, userId) when a user is an agent in that app
 *
 * Intentionally left minimal for now; we’ll add fields as the
 * app-level Agent domain grows.
 */
export interface AgentAppProfile {
  // tbc local props (e.g. app_id, local_tagline, local_badges, visibility)
}

/**
 * Backwards-compat alias while we refactor the stack.
 * Wherever possible, prefer `AgentCoreProfile` directly.
 */
export type AgentProfile = AgentCoreProfile

export { agentConfig }
