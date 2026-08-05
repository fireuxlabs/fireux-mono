import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/stamps.model'

export type EcosystemStatus = 'draft' | 'active' | 'paused' | 'archived'

export interface EcosystemIdentity {
  id: string
  project_id: string
  status: EcosystemStatus
}

export interface EcosystemPresentation {
  name: string
  description: string
  image_url: string
  website_url: string
}

/**
 * Canonical Ecosystem identity.
 *
 * Storage: `ecosystems/{ecosystemId}` in the Ecosystem's named database.
 */
export interface Ecosystem
  extends FireuxStamped,
    EcosystemIdentity,
    EcosystemPresentation {}

/**
 * Bounded local registry projection for the Ecosystem hosted by one Firebase
 * project.
 *
 * Storage: `(default)/ecosystem/{ecosystemId}`.
 */
export interface EcosystemMeta
  extends EcosystemIdentity,
    EcosystemPresentation,
    Pick<FireuxStamped, 'updated'> {
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
  publicRead: 'projection',
  status: 'confirmed',
  root: EcosystemStorage.path,
})

export const EcosystemIdentityModel: EcosystemIdentity = {
  id: '',
  project_id: '',
  status: 'draft',
}

export const EcosystemPresentationModel: EcosystemPresentation = {
  name: '',
  description: '',
  image_url: '',
  website_url: '',
}

export const EcosystemModel: Ecosystem = {
  ...EcosystemIdentityModel,
  ...EcosystemPresentationModel,
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

export const EcosystemMetaModel: EcosystemMeta = {
  ...EcosystemIdentityModel,
  ...EcosystemPresentationModel,
  database_id: '',
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type EcosystemCreateInput = Omit<Ecosystem, 'id' | 'created' | 'updated'>
export type EcosystemUpdateInput = Partial<EcosystemCreateInput>
export type EcosystemMetaInput = Omit<EcosystemMeta, 'updated'>
