import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../../models/utils/entity.model.ts'
import type { FireuxStamped } from '../../models/utils/stamps.model.ts'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

export interface Ecosystem extends FireuxStamped {
  id: string
  project_id: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url: string
}

export interface EcosystemMeta extends Pick<FireuxStamped, 'updated'> {
  id: string
  project_id: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url: string
  database_id: string
}

export const EcosystemStorage = {
  shape: 'root',
  database: 'named',
  path: 'ecosystems/{ecosystemId}',
  collection: 'ecosystems',
  idParam: 'ecosystemId',
} as const

export const EcosystemMetaStorage = {
  shape: 'projection',
  database: '(default)',
  path: 'ecosystem/{ecosystemId}',
  collection: 'ecosystem',
  idParam: 'ecosystemId',
  authority: 'canonical-ecosystem-and-source-config',
} as const

export const EcosystemEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Ecosystem',
  family: 'system',
  identity: 'root',
  authority: 'ecosystem-identity-database',
  appSupport: 'none',
  root: EcosystemStorage.path,
})

export const EcosystemDefaults: Ecosystem = {
  id: '',
  project_id: '',
  status: 'draft',
  name: '',
  description: '',
  image_url: '',
  website_url: '',
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

export const EcosystemMetaDefaults: EcosystemMeta = {
  id: '',
  project_id: '',
  status: 'draft',
  name: '',
  description: '',
  image_url: '',
  website_url: '',
  database_id: '',
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type EcosystemCreateInput = Omit<Ecosystem, 'id' | 'created' | 'updated'>
export type EcosystemUpdateInput = Partial<EcosystemCreateInput>
export type EcosystemMetaInput = Omit<EcosystemMeta, 'updated'>
