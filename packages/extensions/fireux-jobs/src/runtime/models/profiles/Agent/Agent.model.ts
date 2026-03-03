// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export interface AgentCore {
  id: string
  title: string
  summary: string
  agent_bio: string
  agent_image: string
  agent_placement_types: string[]
  agent_coverage_areas: string[]
  agent_contact_email: string
  agent_contact_phone: string
  agent_website_url: string
  subtitle: string
  tagline: string
  tags: string[]
  contact_email: string
  contact_phone: string
  website_url: string
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
}

export const AgentCore: AgentCore = {
  id: '',
  title: '',
  summary: '',
  agent_bio: '',
  agent_image: '',
  agent_placement_types: [],
  agent_coverage_areas: [],
  agent_contact_email: '',
  agent_contact_phone: '',
  agent_website_url: '',
  subtitle: '',
  tagline: '',
  tags: [],
  contact_email: '',
  contact_phone: '',
  website_url: '',
  created: { at: {} as FirebaseTimestamp, by: undefined },
  updated: { at: {} as FirebaseTimestamp, by: undefined },
}

export interface AgentApp {
  id: string
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
}

export const AgentApp: AgentApp = {
  id: '',
  created: { at: {} as FirebaseTimestamp, by: undefined },
  updated: { at: {} as FirebaseTimestamp, by: undefined },
}

export type AgentUserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type AgentResolved = AgentCore & {
  user?: User | AgentUserSummary
}
