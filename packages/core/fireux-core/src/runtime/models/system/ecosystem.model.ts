import type { FirebaseTimestamp } from '../../../types/firebase'

export type FireuxEcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

/**
 * Canon FireUX ecosystem model.
 * Path: `ecosystems/<ecosystemId>`
 */
export interface FireuxEcosystemModel {
  project_id: string
  name: string
  slug: string
  description: string
  status: FireuxEcosystemStatus
  team: string
  apps: string[]
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const FireuxEcosystemModel: FireuxEcosystemModel = {
  project_id: '',
  name: '',
  slug: '',
  description: '',
  status: 'active',
  team: '',
  apps: [],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type FireuxEcosystemDoc = Omit<FireuxEcosystemModel, 'id'>
export type FireuxEcosystemResolved = FireuxEcosystemModel & { id: string }

/**
 * Backward-compatible registry document shape used by existing registry sync.
 * Keep this while migrating old lightweight docs to the full model.
 */
export interface FireuxEcosystemRegistryDoc {
  name: string
  team: string
  apps?: string[]
  project_id?: string
  slug?: string
  description?: string
  status?: FireuxEcosystemStatus
  created_at?: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}
