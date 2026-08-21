import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../../models/utils/entity.model.ts'
import type { FireuxStamped } from '../../models/utils/stamps.model.ts'
import {
  FireuxWorkspaceTeamMemberModel,
  type FireuxWorkspaceTeamMember,
} from '../../models/utils/workspace-entity.model.ts'

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'

export interface Project extends FireuxStamped {
  id: string
  status: ProjectStatus
  name: string
  description: string
  image_url: string
}

/** Local `(default)` projection for this Firebase project's Project. */
export interface ProjectMeta extends Pick<FireuxStamped, 'updated'> {
  id: string
  status: ProjectStatus
  name: string
  description: string
  image_url: string
  database_id: string
}

export type ProjectTeamMember = FireuxWorkspaceTeamMember

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

export const ProjectTeamStorage = {
  shape: 'scoped',
  database: 'named',
  path: 'projects/{projectId}/team/{userId}',
  collection: 'team',
  parent: 'project',
  idParam: 'userId',
} as const

export const ProjectEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Project',
  family: ['system', 'workspace-entity'],
  identity: 'root',
  authority: 'fireux-control-plane',
  appSupport: 'none',
  workspace: true,
  root: ProjectStorage.path,
})

export const ProjectDefaults: Project = {
  id: '',
  status: 'draft',
  name: '',
  description: '',
  image_url: '',
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
  id: '',
  status: 'draft',
  name: '',
  description: '',
  image_url: '',
  database_id: '',
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export const ProjectTeamMemberDefaults: ProjectTeamMember = {
  ...FireuxWorkspaceTeamMemberModel,
}

export type ProjectCreateInput = Pick<Project, 'id' | 'name'> &
  Partial<Pick<Project, 'description' | 'image_url' | 'status'>>
export type ProjectUpdateInput = Partial<
  Pick<Project, 'name' | 'description' | 'image_url' | 'status'>
>
export type ProjectMetaInput = Omit<ProjectMeta, 'updated'>
