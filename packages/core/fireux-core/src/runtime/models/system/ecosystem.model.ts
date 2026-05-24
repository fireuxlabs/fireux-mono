import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System-level product/app grouping
 * Storage: root canonical record; app-scoped private state is future unless implemented
 * Root path: /ecosystems/<ecosystemId>
 * Future app path: /apps/<appId>/ecosystems/<ecosystemId>
 *
 * Decision note:
 * - Ecosystem is a FireUX system-level managed entity/context, not a Firebase project mirror.
 * - It groups products/apps and is managed through Project/App context.
 * - It may map to a Firebase project operationally, but Firebase is infrastructure backing, not entity definition.
 * - Ecosystem is a dependent public/system entity with its own root facade.
 * - An ecosystem cannot exist without a parent project, so `project_id` is required canon.
 * - A project may exist without an ecosystem.
 * - The root ecosystem record is the public-facing ecosystem identity used by FireUX public surfaces.
 * - The app-scoped ecosystem record is a future/private state shape until runtime code implements it.
 * - Keep this model versatile for repo use: public identity/media fields live at root, while app/runtime
 *   specifics can later live in the app-scoped record or downstream scoped children.
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

export type Ecosystem = WidenLiteral<typeof EcosystemModel>

/**
 * Future app-specific ecosystem private state record.
 *
 * This model documents the possible app-scoped shape only. Current canonical
 * Ecosystem truth remains the root /ecosystems/<ecosystemId> record unless a
 * runtime implementation introduces this record explicitly.
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
