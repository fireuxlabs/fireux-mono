import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'
export type ProjectType = 'standalone_app' | 'ecosystem_app'

/**
 * Entity Class: Root
 *
 * Canonical Path: /projects/<projectId>
 *
 * Project is the deployment container for FireUX.
 * It defines the root runtime identity before ecosystem or app layers exist.
 */
export const Project = {
  id: '',

  name: '',
  slug: '',
  description: '',
  image_url: '',

  status: 'active' as ProjectStatus,
  primary_project: false,
  project_type: 'standalone_app' as ProjectType,

  source_url: '',
  console_endpoint_url: '',
  app_id: '',
  ecosystem_id: '',
  firebase_project_id: '',
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

export type Project = {
  [K in keyof typeof Project]: (typeof Project)[K]
}

export type ProjectDoc = Omit<Project, 'id'>
export type ProjectResolved = Project