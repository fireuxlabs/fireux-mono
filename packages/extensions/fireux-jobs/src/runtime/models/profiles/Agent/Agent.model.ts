// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { User } from 'fireux-core/runtime/models/core/user.model'
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

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type AgentCore = {
  [K in keyof typeof AgentCore]: (typeof AgentCore)[K]
}

export const AgentApp = {
  id: '',

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type AgentApp = {
  [K in keyof typeof AgentApp]: (typeof AgentApp)[K]
}

export type AgentUserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type AgentResolved = AgentCore & {
  user?: User | AgentUserSummary
}

export { agentConfig }

