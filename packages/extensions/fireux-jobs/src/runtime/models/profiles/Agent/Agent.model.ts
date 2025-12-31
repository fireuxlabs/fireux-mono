import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import { agentConfig } from './supporting'

/**
 * Firestore shapes only. No UI. No composable wiring. No generics.
 *
 * Core doc:  agents/{uid}
 * App doc:   apps/{appId}/agents/{uid}
 */
export interface AgentCore extends Profile {
  tagline: string
  bio_short: string
  contact_email: string
  contact_phone: string
  website_url: string
}

/**
 * Tenant overlay (delta-only).
 * Keep empty until you truly need tenant-specific fields.
 */
export interface AgentApp extends Profile {}

export { agentConfig }
