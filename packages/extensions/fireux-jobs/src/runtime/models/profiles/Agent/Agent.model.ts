// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts

import type { AppProfileBase, CoreProfileBase } from 'fireux-core/runtime/models/core/profile.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { agentConfig } from './supporting'

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  agents/{uid}
 * App doc:   apps/{appId}/agents/{uid}
 */

export type AgentCoreShape = CoreProfileBase & {
  bio_short: string
  contact_email: string
  contact_phone: string
  website_url: string
}

export const AgentCore: AgentCoreShape = {
  id: '',
  title: '',
  subtitle: '',
  tagline: '',
  tags: [] as string[],

  bio_short: '',
  contact_email: '',
  contact_phone: '',
  website_url: '',

  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type AgentCore = AgentCoreShape

export type AgentAppShape = AppProfileBase

export const AgentApp: AgentAppShape = {
  id: '',
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type AgentApp = AgentAppShape

export { agentConfig }

