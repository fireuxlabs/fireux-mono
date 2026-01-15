// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { agentConfig } from './supporting'

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  agents/{uid}
 * App doc:   apps/{appId}/agents/{uid}
 */

export const AgentCore = {
  id: '',
  title: '',
  subtitle: '',
  tagline: '',
  tags: [] as string[],

  bio_short: '',
  contact_email: '',
  contact_phone: '',
  website_url: '',

  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type AgentCore = {
  [K in keyof typeof AgentCore]: (typeof AgentCore)[K]
}

export const AgentApp = {
  id: '',
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type AgentApp = {
  [K in keyof typeof AgentApp]: (typeof AgentApp)[K]
}

export { agentConfig }

