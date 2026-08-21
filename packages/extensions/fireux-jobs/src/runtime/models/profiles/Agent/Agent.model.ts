// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts
// User-owned Agent profile and directory summary.
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: own exact storage, provision, and public detail/directory shapes.
// Concurrent edit — 2026-07-21 15:26 CEST — Misebox Nitro startup fix: resolve server-loaded core model and Firebase type imports explicitly.

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: docs/ai/gpt-context.md
 *
 * Family: Identity
 * Storage: User-owned profile
 * Path: /users/<userId>/profiles/agent
 *
 * Decision note:
 * - Agent is a User-owned capability/profile record.
 */
export const AgentStorage = {
  shape: 'user-owned',
  path: 'users/{userId}/profiles/agent',
  collection: 'profiles',
  document: 'agent',
  idParam: 'userId',
} as const

export const AgentModel = {
  id: '' as string,
  kind: 'agent' as const,
  title: '' as string,
  summary: '' as string,
  agent_bio: '' as string,
  agent_image: '' as string,
  agent_placement_types: [] as string[],
  agent_coverage_areas: [] as string[],
  // Deliberately published business contacts shown on Agent directory and profile surfaces.
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

export type AgentProfile = Omit<Agent, 'created' | 'updated'>
export type AgentProfilePayload = Omit<AgentProfile, 'id'>
export type AgentDirectoryProfilePayload = Pick<
  AgentProfilePayload,
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
export type AgentDirectoryProfile = AgentDirectoryProfilePayload &
  Pick<AgentProfile, 'id'>

export type AgentCreateInput = Omit<Agent, 'id' | 'created' | 'updated'>
export type AgentUpdateInput = Partial<
  Omit<Agent, 'id' | 'created' | 'updated'>
>

export function createAgentProfileSeed(): AgentCreateInput {
  return {
    title: AgentModel.title,
    kind: AgentModel.kind,
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
