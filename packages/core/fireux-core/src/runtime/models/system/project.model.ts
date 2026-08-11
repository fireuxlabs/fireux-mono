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

export type AppProject = FireuxAppAccessRecord

export const ProjectStorage = {
  shape: 'root',
  database: 'named',
  path: 'projects/{projectId}',
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

export const AppProjectStorage = {
  shape: 'scoped',
  database: 'named',
  path: 'apps/{appId}/projects/{projectId}',
  collection: 'projects',
  parent: 'app',
  idParam: 'projectId',
} as const

export const ProjectEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Project',
  family: ['system', 'console-entity'],
  identity: 'root',
  authority: 'fireux-control-plane',
  appSupport: 'access-record',
  publicRead: 'projection',
  console: true,
  root: ProjectStorage.path,
  appSupportPath: AppProjectStorage.path,
})

export const ProjectIdentityDefaults: ProjectIdentity = {
  id: '',
  status: 'draft',
}

export const ProjectPresentationDefaults: ProjectPresentation = {
  name: '',
  description: '',
  image_url: '',
}

export const ProjectDefaults: Project = {
  ...ProjectIdentityDefaults,
  ...ProjectPresentationDefaults,
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

export const ProjectMetaDefaults: ProjectMeta = {
  ...ProjectIdentityDefaults,
  ...ProjectPresentationDefaults,
  database_id: '',
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export const AppProjectDefaults: AppProject = {
  ...FireuxAppAccessRecordModel,
}

export type ProjectCreateInput = Pick<Project, 'id' | 'name'> &
  Partial<Pick<Project, 'description' | 'image_url' | 'status'>>
export type ProjectUpdateInput = Partial<
  Pick<Project, 'name' | 'description' | 'image_url' | 'status'>
>
export type ProjectMetaInput = Omit<ProjectMeta, 'updated'>
