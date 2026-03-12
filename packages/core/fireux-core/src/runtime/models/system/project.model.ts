import type { FirebaseTimestamp } from '../../../types/firebase'

export type FireuxProjectStatus = 'draft' | 'active' | 'paused' | 'archived'
export type FireuxProjectType = 'standalone-app' | 'ecosystem-app'

/**
 * Canon FireUX project model.
 * Path: `projects/<projectId>`
 */
export interface FireuxProjectModel {
  name: string
  slug: string
  description: string
  status: FireuxProjectStatus

  project_type: FireuxProjectType
  source_url: string
  console_endpoint_url: string
  app_id: string
  ecosystem_id: string
  firebase_project_id: string

  owner_user_id: string
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const FireuxProjectModel: FireuxProjectModel = {
  name: '',
  slug: '',
  description: '',
  status: 'active',
  project_type: 'standalone-app',
  source_url: '',
  console_endpoint_url: '',
  app_id: '',
  ecosystem_id: '',
  firebase_project_id: '',
  owner_user_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type FireuxProjectDoc = Omit<FireuxProjectModel, 'id'>
export type FireuxProjectResolved = FireuxProjectModel & { id: string }
