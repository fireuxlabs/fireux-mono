// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Entity Class: Dual-Layer
 * Core Path: /agents/<userId>
 * App Path: /apps/<appId>/agents/<userId>
 */
export const AgentCore = {
  id: '',
  title: '',
  summary: '',
  agent_bio: '',
  agent_image: '',
  agent_placement_types: [] as string[],
  agent_coverage_areas: [] as string[],
  agent_contact_email: '',
  agent_contact_phone: '',
  agent_website_url: '',
  subtitle: '',
  tagline: '',
  tags: [] as string[],
  contact_email: '',
  contact_phone: '',
  website_url: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type AgentCore = {
  [K in keyof typeof AgentCore]: (typeof AgentCore)[K]
}

export const AgentApp = {
  id: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type AgentApp = {
  [K in keyof typeof AgentApp]: (typeof AgentApp)[K]
}

export type AgentUserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type AgentResolved = AgentCore & {
  user?: User | AgentUserSummary
}
