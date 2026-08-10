import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/stamps.model'

export type AppStatus = 'draft' | 'active' | 'paused' | 'archived'
export type AppRole = 'global' | 'tenant' | 'standalone'

export interface AppMedia {
  thumbnail_url: string
  logo_url: string
  wordmark_light_url: string
  wordmark_dark_url: string
  cover_url: string
}

/** Directory transport metadata; not part of canonical App storage. */
export interface AppSocialLinks {
  website: string
  twitter: string
  github: string
  linkedin: string
  instagram: string
  facebook: string
  youtube: string
  email: string
}

/** Derived directory transport metadata; never stored on canonical App. */
export interface AppDerived {
  user_count: number
}

/** Extension-owned Console identifier projected from runtime registration. */
export type AppConsoleFamily = string

export interface AppIdentity {
  id: string
  project_id: string
  ecosystem_id?: string
  role: AppRole
  status: AppStatus
}

/** Opaque extension-owned root relationship; Core never enumerates families. */
export interface AppPrimaryEntityReference {
  family: string
  id: string
}

export interface AppPresentation {
  name: string
  short_name: string
  description: string
  media: AppMedia
}

export interface App extends FireuxStamped, AppIdentity, AppPresentation {
  self_join_enabled: boolean
  primary_entity?: AppPrimaryEntityReference
}

export interface AppMeta
  extends AppIdentity,
    AppPresentation,
    Pick<FireuxStamped, 'updated'> {
  database_id: string
  website_url: string
  console_families: AppConsoleFamily[]
}

export const AppStorage = {
  shape: 'root',
  database: 'named',
  path: 'apps/{appId}',
  collection: 'apps',
  idParam: 'appId',
} as const

export const AppMetaStorage = {
  shape: 'projection',
  database: '(default)',
  path: 'apps/{appId}',
  collection: 'apps',
  idParam: 'appId',
  authority: 'canonical-app-and-source-config',
} as const

export const AppEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'App',
  family: ['core', 'system'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'none',
  publicRead: 'projection',
  status: 'confirmed',
  root: AppStorage.path,
})

export const AppIdentityDefaults: AppIdentity = {
  id: '',
  project_id: '',
  ecosystem_id: '',
  role: '' as AppRole,
  status: 'draft',
}

export const AppPresentationDefaults: AppPresentation = {
  name: '',
  short_name: '',
  description: '',
  media: {
    thumbnail_url: '',
    logo_url: '',
    wordmark_light_url: '',
    wordmark_dark_url: '',
    cover_url: '',
  },
}

export const AppDefaults: App = {
  ...AppIdentityDefaults,
  ...AppPresentationDefaults,
  self_join_enabled: false,
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

export const AppMetaDefaults: AppMeta = {
  ...AppIdentityDefaults,
  ...AppPresentationDefaults,
  database_id: '',
  website_url: '',
  console_families: [],
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type AppCreateInput = Omit<App, 'created' | 'updated'>
export type AppUpdateInput = Partial<Omit<App, 'id' | 'created' | 'updated'>>
export type AppMetaInput = Omit<AppMeta, 'updated'>
