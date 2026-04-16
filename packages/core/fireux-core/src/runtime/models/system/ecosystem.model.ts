import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System
 * Storage: root canonical record plus app-scoped record
 * Root path: /ecosystem/<ecosystemId>
 * App path: /apps/<appId>/ecosystem/<ecosystemId>
 *
 * Decision note:
 * - Ecosystem is a dependent public entity with its own root facade.
 * - An ecosystem cannot exist without a parent project, so `project_id` is required canon.
 * - A project may exist without an ecosystem.
 * - The root ecosystem record is the public-facing ecosystem identity used by FireUX public surfaces.
 * - The app-scoped ecosystem record holds app-local/private ecosystem state when needed.
 * - Keep this model versatile for repo use: public identity/media fields live at root, while app/runtime
 *   specifics can live in the app-scoped record or downstream scoped children.
 * - If this decision changes, update the models README first, then this file.
 */
export const EcosystemModel = {
  id: '',

  project_id: '',
  name: '',
  slug: '',
  description: '',
  image_url: '',
  source_url: '',
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

/**
 * App-specific ecosystem record.
 */
export const AppEcosystemModel = {
  id: '',

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

export type AppEcosystem = {
  [K in keyof typeof AppEcosystemModel]: (typeof AppEcosystemModel)[K]
}

export type EcosystemCreateInput = Omit<Ecosystem, 'id' | 'created' | 'updated'>
export type EcosystemUpdateInput = Partial<
  Omit<Ecosystem, 'id' | 'created' | 'updated'>
>
