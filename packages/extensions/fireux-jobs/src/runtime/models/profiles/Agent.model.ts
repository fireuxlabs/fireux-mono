// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent.model.ts

import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'

/** Unified Agent wrapper (core + app overlays) */
export interface Agent {
  id: string
  display_name?: string
  avatar?: string
  core: AgentCoreProfile | null
  app?: AgentAppProfile | null
}

/**
 * Card + domain shapes
 * - All “profile fields” live inside ProfileCore / ProfileApp
 * - Core/App remain delta-friendly
 */
export namespace AgentCard {
  /** Pill shape */
  export interface Pill extends PillModel.Props {}

  /** Cell shape */
  export interface Cell extends Pill {
    id: string
    bio_short?: string | null
    specialties?: string[]
    locations?: string[]
  }

  /** Full CORE profile surface */
  export interface ProfileCore extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    title?: string | null
    subtitle?: string | null
    badges?: string[]
    bio_long?: string | null
    avatar?: string | null
    avatar_url?: string | null
    organization_name?: string | null
  }

  /** Tenant APP overlay (delta space) */
  export interface ProfileApp extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    title?: string | null
    subtitle?: string | null
    bio_short?: string | null
    specialties?: string[]
    locations?: string[]
  }
}

/**
 * Firestore-facing profile types
 * - Core profile == UI ProfileCore
 * - App profile == UI ProfileApp
 * - AgentProfile used when a generic profile type is needed
 */
export type AgentProfile = AgentCard.ProfileCore
export type AgentCoreProfile = AgentCard.ProfileCore
export type AgentAppProfile = AgentCard.ProfileApp

/** Config */
export const agentConfig: ProfileConfig = {
  id: 'agent',
  collectionName: 'agents',
  profileType: 'Agent',
  cta: 'Create your Agent profile to appear in listings.',
} as const
