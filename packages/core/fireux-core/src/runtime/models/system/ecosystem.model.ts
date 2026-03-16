import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

/**
 * Entity Class: Root
 *
 * Canonical Path: /ecosystems/<ecosystemId>
 *
 * Ecosystem is the logical platform boundary inside a project.
 */
export const Ecosystem = {
  id: '',

  project_id: '',
  name: '',
  slug: '',
  description: '',
  status: 'active' as EcosystemStatus,
  team: '',
  apps: [] as string[],

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Ecosystem = {
  [K in keyof typeof Ecosystem]: (typeof Ecosystem)[K]
}

export type EcosystemDoc = Omit<Ecosystem, 'id'>
export type EcosystemResolved = Ecosystem
