// @ts-nocheck
// Snapshot of packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts taken on 2025-11-03
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

/** Unified Agent */
export interface Agent {
  id: string
  display_name?: string
  avatar?: string
  core: AgentCoreProfile | null
  app?: AgentAppProfile | null
}

/** Global: agents/{uid} */
export interface AgentCoreProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
}

/** App overlay: apps/{appId}/agents/{uid} */
export interface AgentAppProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  specialties?: string[]
}

/** Cards */
export namespace AgentCard {
  export interface Pill {
    id: string
    display_name: string
    avatar?: string
    title?: string | null
  }
  export interface Cell extends Pill {
    bio_short?: string | null
    specialties?: string[]
  }
  export interface Profile extends Cell {
    bio_long?: string | null
  }
}

/** Config */
export const agentConfig: ProfileConfig = {
  id: 'agent',
  collectionName: 'agents',
  profileType: 'Agent',
  cta: 'Create your Agent profile to appear in listings.',
} as const
