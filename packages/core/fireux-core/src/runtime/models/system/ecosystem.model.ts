import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System
 * Storage: root canonical model
 * Root path: /ecosystems/<ecosystemId>
 * Runtime face: project-managed facade when ecosystems are being handled inside a project runtime surface
 *
 * Decision note:
 * - Ecosystem is a stored system entity, not a second app-scoped record by default.
 * - A project runtime surface may manage Ecosystem through a facade over this root record.
 * - If real scoped stored state appears later, update the models README first, then this file.
 */
export const EcosystemModel = {
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
  [K in keyof typeof EcosystemModel]: (typeof EcosystemModel)[K]
}

export type EcosystemCreateInput = Omit<Ecosystem, 'id' | 'created' | 'updated'>
export type EcosystemUpdateInput = Partial<Omit<Ecosystem, 'id' | 'created' | 'updated'>>
