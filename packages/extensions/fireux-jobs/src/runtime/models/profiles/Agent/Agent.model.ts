// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: public Agent contacts and Professional summary cleanup.
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: own exact storage, provision, and public detail/directory shapes.
// Concurrent edit — 2026-07-21 15:26 CEST — Misebox Nitro startup fix: resolve server-loaded core model and Firebase type imports explicitly.

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/meta.model.ts'
import type { AppProfileBase } from 'fireux-core/runtime/models/core/profile.model.ts'
import { AppProfileStamps } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase.ts'

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
export const AgentStorage = {
  shape: 'both',
  root: 'agents/{userId}',
  overlay: 'apps/{appId}/agents/{userId}',
  rootCollection: 'agents',
  overlayCollection: 'agents',
  idParam: 'userId',
} as const

export const AppAgentStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/agents/{userId}',
  collection: 'agents',
  parent: 'app',
  idParam: 'userId',
} as const

export const AgentModel = {
  id: '' as string,
  title: '' as string,
  summary: '' as string,
  agent_bio: '' as string,
  agent_image: '' as string,
  agent_placement_types: [] as string[],
  agent_coverage_areas: [] as string[],
  // Public business contacts shown on Agent directory and profile surfaces.
  agent_contact_email: '' as string,
  agent_contact_phone: '' as string,
  agent_website_url: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  tags: [] as string[],
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

export type PublicAgentProfile = Omit<Agent, 'created' | 'updated'>
export type PublicAgentProfilePayload = Omit<PublicAgentProfile, 'id'>
export type PublicAgentDirectoryProfilePayload = Pick<
  PublicAgentProfilePayload,
  | 'title'
  | 'summary'
  | 'agent_bio'
  | 'agent_image'
  | 'agent_placement_types'
  | 'tags'
  | 'agent_contact_email'
  | 'agent_contact_phone'
  | 'agent_website_url'
>
export type PublicAgentDirectoryProfile = PublicAgentDirectoryProfilePayload &
  Pick<PublicAgentProfile, 'id'>

export const AppAgentModel = {
  id: '' as string,
  ...AppProfileStamps,
} as const

export type AppAgent = AppProfileBase

export type AgentCreateInput = Omit<Agent, 'id' | 'created' | 'updated'>
export type AgentUpdateInput = Partial<
  Omit<Agent, 'id' | 'created' | 'updated'>
>

export function createAgentProfileSeed(): AgentCreateInput {
  return {
    title: AgentModel.title,
    summary: AgentModel.summary,
    agent_bio: AgentModel.agent_bio,
    agent_image: AgentModel.agent_image,
    agent_placement_types: [...AgentModel.agent_placement_types],
    agent_coverage_areas: [...AgentModel.agent_coverage_areas],
    agent_contact_email: AgentModel.agent_contact_email,
    agent_contact_phone: AgentModel.agent_contact_phone,
    agent_website_url: AgentModel.agent_website_url,
    subtitle: AgentModel.subtitle,
    tagline: AgentModel.tagline,
    tags: [...AgentModel.tags],
  }
}
