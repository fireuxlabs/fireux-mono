// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Identity
 * Storage: root canonical record plus app overlay
 * Root path: /agents/<userId>
 * Overlay path: /apps/<appId>/agents/<userId>
 *
 * Decision note:
 * - Agent is an identity profile first, with app-scoped stored truth only where real operational state exists.
 * - The overlay is deliberately small until an app truly needs more scoped state.
 * - If this changes later, update the models README first, then this file.
 */
export const AgentModel = {
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

export type Agent = {
  [K in keyof typeof AgentModel]: (typeof AgentModel)[K]
}

// Compatibility aliases retained while call sites are still being migrated.
export const AgentCore = AgentModel
export type AgentCore = Agent

export const AppAgentModel = {
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

export type AppAgent = {
  [K in keyof typeof AppAgentModel]: (typeof AppAgentModel)[K]
}

// Compatibility aliases retained while call sites are still being migrated.
export const AgentApp = AppAgentModel
export type AgentApp = AppAgent

export type AgentCreateInput = Omit<Agent, 'id' | 'created' | 'updated'>
export type AgentUpdateInput = Partial<Omit<Agent, 'id' | 'created' | 'updated'>>
