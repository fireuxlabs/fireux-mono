import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../core/entity.model'
import type { FireuxStamped } from '../core/meta.model'
import { FireuxConsoleAccessModel } from '../core/meta.model'

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'
export type ProjectType = 'standalone_app' | 'ecosystem_app'

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
 * Family: Console-backed system root entity
 * Storage: root canonical record
 * Root path: /projects/<projectId>
 * Management surface: /console/project in fireux-app
 *
 * Decision note:
 * - Project is root-only. App, Ecosystem, and the active runtime App reference
 *   the same root Project entity.
 * - Canonical Project identity, relationships, and operator authority live on
 *   the root Project record.
 * - Project access is not inferred from App, Kitchen, or another entity's team.
 * - Project creation creates only the root Project record.
 * - `owner_user_id` is a canonical root ownership hint, not a replacement for any app-level authority system.
 * - `operator_ids` is canonical root Project console authority.
 * - The Project console may manage related App and Ecosystem surfaces, but those surfaces edit each entity's own stored truth.
 * - A Project management surface must not invent separate App or Ecosystem stored identities unless the model docs say so.
 * - Public page depth can vary by family; Project may stay relatively thin
 *   publicly while remaining a normal root entity.
 * - If Project later grows operational child records, discuss their ownership before adding a scoped Project representation.
 * - Project still remains a system-level special case because endpoint enrichment and system metadata are central to its runtime.
 * - If this decision changes, update the entity map and this source together.
 */
export const ProjectStorage = {
  shape: 'public/root',
  path: 'projects/{projectId}',
  collection: 'projects',
  idParam: 'projectId',
} as const

export const ProjectEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Project',
  family: ['system', 'console-entity'],
  storage: 'root',
  status: 'confirmed',
  console: true,
  root: ProjectStorage.path,
})

export const ProjectModel = {
  id: '',
  ...FireuxConsoleAccessModel,

  // Public-facing identity
  name: '',
  slug: '',
  description: '',
  image_url: '',
  status: 'active' as ProjectStatus,

  // System/runtime identity
  source_url: '',
  primary_project: false,
  project_type: 'standalone_app' as ProjectType,
  console_endpoint_url: '',
  app_id: '',
  ecosystem_id: '',
  firebase_project_id: '',

  // Canonical root ownership hint
  owner_user_id: '',
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

export type ProjectCreateInput = Pick<
  Project,
  | 'id'
  | 'name'
  | 'slug'
  | 'project_type'
  | 'source_url'
  | 'console_endpoint_url'
  | 'app_id'
  | 'ecosystem_id'
  | 'firebase_project_id'
> &
  Partial<
    Pick<
      Project,
      | 'description'
      | 'image_url'
      | 'primary_project'
      | 'status'
      | 'owner_user_id'
      | 'operator_ids'
    >
  >

export type ProjectUpdateInput = Partial<Omit<Project, 'id' | 'created' | 'updated'>>
