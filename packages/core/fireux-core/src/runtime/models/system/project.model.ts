// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: declare private Project control-plane authority.
import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/stamps.model'
import {
  FireuxAppAccessRecordModel,
  type FireuxAppAccessRecord,
} from '../utils/console-entity.model'

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'

export interface ProjectIdentity {
  id: string
  status: ProjectStatus
}

export interface ProjectPresentation {
  name: string
  description: string
  image_url: string
}

export interface Project
  extends FireuxStamped,
    ProjectIdentity,
    ProjectPresentation {}

/** Local `(default)` projection for this Firebase project's Project. */
export interface ProjectMeta
  extends ProjectIdentity,
    ProjectPresentation,
    Pick<FireuxStamped, 'updated'> {
  database_id: string
}

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
  database: 'named',
  root: 'projects/{projectId}',
  scope: 'apps/{appId}/projects/{projectId}',
  rootCollection: 'projects',
  scopeCollection: 'projects',
  collection: 'projects',
  idParam: 'projectId',
} as const

export const ProjectMetaStorage = {
  shape: 'projection',
  database: '(default)',
  path: 'project/{projectId}',
  collection: 'project',
  idParam: 'projectId',
  authority: 'canonical-project-and-source-config',
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

export const ProjectIdentityModel: ProjectIdentity = {
  id: '',
  status: 'draft',
}

export const ProjectPresentationModel: ProjectPresentation = {
  name: '',
  description: '',
  image_url: '',
}

export const ProjectModel: Project = {
  ...ProjectIdentityModel,
  ...ProjectPresentationModel,
  status: 'active',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export const ProjectMetaModel: ProjectMeta = {
  ...ProjectIdentityModel,
  ...ProjectPresentationModel,
  database_id: '',
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export const AppProjectModel = {
  ...FireuxAppAccessRecordModel,
} as const

export type AppProject = FireuxAppAccessRecord

export type ProjectCreateInput = Pick<Project, 'id' | 'name'> &
  Partial<Pick<Project, 'description' | 'image_url' | 'status'>>
export type ProjectUpdateInput = Partial<
  Pick<Project, 'name' | 'description' | 'image_url' | 'status'>
>
export type ProjectMetaInput = Omit<ProjectMeta, 'updated'>
