import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System
 * Storage: root canonical model
 * Root path: /ecosystems/<ecosystemId>
 * Console face: project-console facade when ecosystems are being managed inside a project console
 *
 * Decision note:
 * - Ecosystem is a stored system entity, not a second scoped overlay by default.
 * - A project console may manage Ecosystem through a facade over this root record.
 * - If real scoped stored state appears later, update the models README first, then this file.
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
