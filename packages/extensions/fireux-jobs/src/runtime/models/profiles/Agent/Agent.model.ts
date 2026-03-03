// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  agents/{uid}
 * App doc:   apps/{appId}/agents/{uid}
 */

export const AgentCore = {
  id: '',

  // Agent (scoped, v1)
  title: '',
  summary: '',
  agent_bio: '',
  agent_image: '',

  // Agent descriptors (scoped)
  agent_placement_types: [] as string[],
  agent_coverage_areas: [] as string[],

  // Agent contact (scoped)
  agent_contact_email: '',
  agent_contact_phone: '',
  agent_website_url: '',

  // Legacy (deprecated) — kept temporarily for non-breaking migration
  subtitle: '',
  tagline: '',
  tags: [] as string[],
  contact_email: '',
  contact_phone: '',
  website_url: '',

  // Stamps
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
} as const

export type AgentCore = {
  [K in keyof typeof AgentCore]: (typeof AgentCore)[K]
}

export const AgentApp = {
  id: '',

  // Stamps
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
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
