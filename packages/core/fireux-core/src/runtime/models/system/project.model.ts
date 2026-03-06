import type { FirebaseTimestamp } from '../../../types/firebase'

export type FireuxProjectStatus = 'draft' | 'active' | 'paused' | 'archived'

/**
 * Canon FireUX project model.
 * Path: `projects/<projectId>`
 */
export interface FireuxProjectModel {
  name: string
  slug: string
  description: string
  status: FireuxProjectStatus
  owner_user_id: string
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const FireuxProjectModel: FireuxProjectModel = {
  name: '',
  slug: '',
  description: '',
  status: 'active',
  owner_user_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type FireuxProjectDoc = Omit<FireuxProjectModel, 'id'>
export type FireuxProjectResolved = FireuxProjectModel & { id: string }
