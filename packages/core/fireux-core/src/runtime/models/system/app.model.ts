import type { FirebaseTimestamp } from '../../../types/firebase'

export type FireuxSystemAppStatus = 'draft' | 'active' | 'paused' | 'archived'

/**
 * Canon FireUX system app model (project layer).
 * Path: `apps/<appId>`
 */
export interface FireuxSystemAppModel {
  project_id: string
  ecosystem_id: string
  name: string
  slug: string
  description: string
  status: FireuxSystemAppStatus
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const FireuxSystemAppModel: FireuxSystemAppModel = {
  project_id: '',
  ecosystem_id: '',
  name: '',
  slug: '',
  description: '',
  status: 'active',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type FireuxSystemAppDoc = Omit<FireuxSystemAppModel, 'id'>
export type FireuxSystemAppResolved = FireuxSystemAppModel & { id: string }

/**
 * Backward-compatible registry shape used by current registry endpoint.
 */
export interface FireuxSystemAppRegistryDoc {
  name: string
  team: string
  ecosystem: string
  project_id?: string
  ecosystem_id?: string
  slug?: string
  description?: string
  status?: FireuxSystemAppStatus
  created_at?: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}
