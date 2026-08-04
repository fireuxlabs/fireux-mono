import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/stamps.model'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

/** Canonical Ecosystem identity stored at `ecosystems/{ecosystemId}`. */
export interface Ecosystem extends FireuxStamped {
  id: string
  project_id: string
  name: string
  slug: string
  description: string
  image_url: string
  website_url: string
  status: EcosystemStatus
}

export const EcosystemStorage = {
  shape: 'root',
  path: 'ecosystems/{ecosystemId}',
  collection: 'ecosystems',
  idParam: 'ecosystemId',
} as const

export const EcosystemEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Ecosystem',
  family: 'system',
  identity: 'root',
  authority: 'ecosystem-identity-database',
  appSupport: 'none',
  publicRead: 'projection',
  status: 'confirmed',
  root: EcosystemStorage.path,
})

export const EcosystemModel: Ecosystem = {
  id: '',
  project_id: '',
  name: '',
  slug: '',
  description: '',
  image_url: '',
  website_url: '',
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

export type EcosystemCreateInput = Omit<Ecosystem, 'id' | 'created' | 'updated'>
export type EcosystemUpdateInput = Partial<EcosystemCreateInput>
