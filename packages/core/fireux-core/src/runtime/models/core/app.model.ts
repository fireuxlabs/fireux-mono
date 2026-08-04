import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/stamps.model'

export type AppStatus = 'draft' | 'active' | 'paused' | 'archived'
export type AppRole =
  | 'global'
  | 'tenant'
  | 'standalone'
  | 'ecosystem'
  | 'system'
export type AppSize = 'big' | 'small'

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

export interface AppMedia {
  thumbnail_url: string
  logo_url: string
  wordmark_light_url: string
  wordmark_dark_url: string
  cover_url: string
}

export interface AppDerived {
  user_count: number
}

export const APP_CONSOLE_FAMILIES = [
  'blank',
  'kitchen',
  'portfolio',
  'project',
  'property',
  'supplier',
] as const

export type AppConsoleFamily = (typeof APP_CONSOLE_FAMILIES)[number]

export interface AppRepoMetadata {
  key: string
  workspace: string
  launch_order: number
  console_families: AppConsoleFamily[]
  database_id: string
}

/** Canonical App identity stored at `apps/{appId}`. */
export interface App extends FireuxStamped {
  id: string
  project_id: string
  ecosystem_id?: string
  database_id: string
  slug: string
  status: AppStatus

  app_name: string
  app_short_name: string
  role: AppRole
  tagline: string
  description: string
  short_bio: string
  long_bio: string
  social_links: AppSocialLinks
  derived: AppDerived
  media: AppMedia

  fireux_native: boolean
  fireux_size: AppSize
  fireux_repo: AppRepoMetadata
  self_join_enabled: boolean
  moderation_state: string
  ban_reasons: string[]
}

export const AppStorage = {
  shape: 'root',
  path: 'apps/{appId}',
  collection: 'apps',
  idParam: 'appId',
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

export const AppModel: App = {
  id: '',
  project_id: '',
  ecosystem_id: '',
  database_id: '',
  slug: '',
  status: 'active',

  app_name: '',
  app_short_name: '',
  role: '' as AppRole,
  tagline: '',
  description: '',
  short_bio: '',
  long_bio: '',
  social_links: {} as AppSocialLinks,
  derived: { user_count: 0 },
  media: {
    thumbnail_url: '',
    logo_url: '',
    wordmark_light_url: '',
    wordmark_dark_url: '',
    cover_url: '',
  },

  fireux_native: false,
  fireux_size: 'small',
  fireux_repo: {
    key: '',
    workspace: '',
    launch_order: 0,
    console_families: [],
    database_id: '',
  },
  self_join_enabled: false,
  moderation_state: '',
  ban_reasons: [],

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

/** Existing consumers use `AppModel` as both the default value and its type. */
export type AppModel = App

export type AppCreateInput = Omit<App, 'created' | 'updated'>
export type AppUpdateInput = Partial<Omit<App, 'id' | 'created' | 'updated'>>
