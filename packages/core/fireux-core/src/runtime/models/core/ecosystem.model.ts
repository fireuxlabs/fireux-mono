// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: declare Ecosystem identity-database and projection authority.
import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/meta.model'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

/**
 * Entity map: docs/concepts/entities.md
 *
 * Family: System-level product/app grouping
 * Storage: root canonical record
 * Root path: /ecosystems/<ecosystemId>
 *
 * Decision note:
 * - Ecosystem is a FireUX system-level managed entity/context, not a Firebase project mirror.
 * - It groups products/apps and is managed through Project/App context.
 * - It may map to a Firebase project operationally, but Firebase is infrastructure backing, not entity definition.
 * - Ecosystem is a dependent public/system entity with its own root facade.
 * - An ecosystem cannot exist without a parent project, so `project_id` is required canon.
 * - A project may exist without an ecosystem.
 * - The owning ecosystem database holds canonical truth. FireUX platform
 *   surfaces consume a safe directory projection, never a second Ecosystem.
 * - Apps associated with an Ecosystem remain ordinary root App entities.
 * - Apps point to Ecosystem with `App.ecosystem_id`; Ecosystem stores no inverse
 *   App id array.
 * - Keep this model focused on root ecosystem identity and relationships.
 * - If this decision changes, update the entity map and this source together.
 */
export const EcosystemCanonicalStorage = {
  shape: 'public/root',
  path: 'ecosystems/{ecosystemId}',
  collection: 'ecosystems',
  idParam: 'ecosystemId',
} as const

/** @deprecated Prefer the authority-explicit EcosystemCanonicalStorage name. */
export const EcosystemStorage = EcosystemCanonicalStorage

export const EcosystemEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Ecosystem',
  family: 'system',
  identity: 'root',
  authority: 'ecosystem-identity-database',
  appSupport: 'none',
  publicRead: 'projection',
  status: 'confirmed',
  root: EcosystemStorage.path,
})

export const EcosystemModel = {
  id: '',

  // Root-entity relationships
  project_id: '',

  // Public identity
  name: '',
  slug: '',
  description: '',
  image_url: '',
  website_url: '',
  status: 'active' as EcosystemStatus,

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

export type EcosystemCreateInput = Omit<Ecosystem, 'id' | 'created' | 'updated'>
export type EcosystemUpdateInput = Partial<
  Omit<Ecosystem, 'id' | 'created' | 'updated'>
>
