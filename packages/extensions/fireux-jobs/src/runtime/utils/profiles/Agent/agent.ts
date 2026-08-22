import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Agent } from '../../../models/profiles/Agent/Agent.model'

export type * from '../../../models/profiles/Agent/Agent.model'
export const AgentStorage = { shape: 'user-owned', path: 'users/{userId}/profiles/agent', collection: 'profiles', document: 'agent', idParam: 'userId' } as const
export const AgentDefaults: Agent = { id: '', kind: 'agent', title: '', summary: '', agent_bio: '', agent_image: '', agent_placement_types: [], agent_coverage_areas: [], agent_contact_email: '', agent_contact_phone: '', agent_website_url: '', subtitle: '', tagline: '', tags: [], created: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['created']['by'] }, updated: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['updated']['by'] } }
export type AgentProfile = Omit<Agent, 'created' | 'updated'>
export type AgentProfilePayload = Omit<AgentProfile, 'id'>
export type AgentDirectoryProfilePayload = Pick<AgentProfilePayload, 'title' | 'summary' | 'agent_bio' | 'agent_image' | 'agent_placement_types' | 'tags' | 'agent_contact_email' | 'agent_contact_phone' | 'agent_website_url'>
export type AgentDirectoryProfile = AgentDirectoryProfilePayload & Pick<AgentProfile, 'id'>
export type AgentCreateInput = Omit<Agent, 'id' | 'created' | 'updated'>
export type AgentUpdateInput = Partial<Omit<Agent, 'id' | 'created' | 'updated'>>
export function createAgentProfileSeed(): AgentCreateInput { const { id: _id, created: _created, updated: _updated, ...seed } = AgentDefaults; return { ...seed, agent_placement_types: [], agent_coverage_areas: [], tags: [] } }
