// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: declare private Project control-plane authority.
import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/stamps.model'
import {
  FireuxAppAccessRecordModel,
  type FireuxAppAccessRecord,
} from '../utils/console-entity.model'

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'

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
 * Family: FireUX control-plane root entity
 * Storage: private control-plane root plus FireUX App access support
 * Root path: /projects/<projectId>
 * App path: /apps/<appId>/projects/<projectId>
 * Management surface: /console/project in fireux-app
 *
 * Decision note:
 * - Project is canonical only in the FireUX control plane. It is not a public
 *   directory entity and is not bootstrapped into every ecosystem database.
 * - App and Ecosystem records point to their parent with `project_id`.
 * - Project does not store inverse `app_id`, `ecosystem_id`, or access lists.
 * - The root owns Project identity and control-plane configuration.
 * - The AppProject record determines which Projects are attached to the
 *   FireUX App Console and owns only access/support fields.
 * - The Project console may manage related App and Ecosystem surfaces, but those surfaces edit each entity's own stored truth.
 * - A Project management surface must not invent separate App or Ecosystem stored identities unless the model docs say so.
 * - If this decision changes, update the entity map and this source together.
 */
export const ProjectStorage = {
  shape: 'root-and-app-support',
  root: 'projects/{projectId}',
  scope: 'apps/{appId}/projects/{projectId}',
  rootCollection: 'projects',
  scopeCollection: 'projects',
  collection: 'projects',
  idParam: 'projectId',
} as const

export const ProjectEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Project',
  family: ['system', 'console-entity'],
  identity: 'root',
  authority: 'fireux-control-plane',
  appSupport: 'access-record',
  publicRead: 'none',
  status: 'confirmed',
  console: true,
  root: ProjectStorage.root,
  appSupportPath: ProjectStorage.scope,
})

export const ProjectModel = {
  id: '',

  // Control-plane identity
  name: '',
  slug: '',
  description: '',
  image_url: '',
  status: 'active' as ProjectStatus,
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

export type Project = WidenLiteral<typeof ProjectModel>

export const AppProjectModel = {
  ...FireuxAppAccessRecordModel,
} as const

export type AppProject = FireuxAppAccessRecord

export type ProjectCreateInput = Pick<Project, 'id' | 'name' | 'slug'> &
  Partial<Pick<Project, 'description' | 'image_url' | 'status'>>
