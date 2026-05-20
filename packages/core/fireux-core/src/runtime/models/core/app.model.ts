// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type {
  AppDerived,
  AppMedia,
  AppRepoMetadata,
  AppRole,
  AppSize,
  AppSocialLinks,
} from './supporting/app'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System root entity + active runtime singleton
 * Storage: root canonical model
 * Root path: /apps/<appId>
 * Active seam: useApp() resolves FireUXConfig.appId
 * Management face: App Control when apps are managed through FireUX project/app tools
 *
 * Decision note:
 * - App is stored once as canonical system truth.
 * - Dashboard and control surfaces edit the same root App record.
 * - `fireux/app` is for app shell, context, orchestration, and config helpers; App entity data belongs in the Firestore App stack.
 * - A runtime surface may manage App, but that does not justify a second stored app-scoped record yet.
 * - If real scoped stored state appears later, update the models README first, then this file.
 */

export type AppStatus = 'draft' | 'active' | 'paused' | 'archived'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { [K in keyof T]: WidenLiteral<T[K]> }
  : T

export const AppModel = {
  id: '',

  // Registry + hierarchy
  project_id: '',
  ecosystem_id: '',
  database_id: '',
  slug: '',
  status: 'active' as AppStatus,
  team: '',

  // Identity + brand
  app_name: '',
  app_short_name: '',
  role: '' as AppRole,
  ecosystem: '',

  tagline: '',
  description: '',
  short_bio: '',
  long_bio: '',

  social_links: {} as AppSocialLinks,
  derived: {
    user_count: 0,
  } as AppDerived,
  media: {
    thumbnail_url: '',
    logo_url: '',
    wordmark_light_url: '',
    wordmark_dark_url: '',
    cover_url: '',
  } as AppMedia,

  // FireUX repo/build metadata.
  fireux_native: false,
  fireux_size: 'small' as AppSize,
  fireux_repo: {
    key: '',
    workspace: '',
    launch_order: 0,
    console_families: [] as string[],
    database_id: '',
  } as AppRepoMetadata,

  // Governance
  join_requests: [] as string[],
  admin_ids: [] as string[],
  moderation_state: '',
  ban_reasons: [] as string[],

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

export type AppModel = WidenLiteral<typeof AppModel>
export type App = AppModel

/**
 * App field groups.
 *
 * App stored truth lives once at `apps/{appId}`.
 * These groups do not create separate App records. They only say which surface
 * should handle each field on the same root App record.
 *
 * Simple rule:
 * - Admin runs the app.
 * - Developer builds and checks the app.
 * - App Control changes where the app belongs.
 * - System maintains calculated/internal fields.
 */
export const AppFieldGroups = {
  /**
   * Admin runs the app.
   * These fields affect public content, members, join requests, and admins.
   */
  admin: [
    'tagline',
    'description',
    'short_bio',
    'long_bio',
    'social_links',
    'join_requests',
    'admin_ids',
  ],

  /**
   * Developer builds and checks the app.
   * These fields affect assets, database/config, and repo metadata.
   */
  developer: [
    'media',
    'database_id',
    'fireux_native',
    'fireux_size',
    'fireux_repo',
  ],

  /**
   * App Control changes where the app belongs.
   * These fields can affect routing, identity, SEO, cards, and registries.
   */
  control: [
    'project_id',
    'ecosystem_id',
    'slug',
    'status',
    'team',
    'role',
    'ecosystem',
    'app_name',
    'app_short_name',
  ],

  /**
   * System maintains these fields.
   * Normal product UI should not edit them directly.
   */
  system: [
    'id',
    'derived',
    'created',
    'updated',
  ],
} as const

export type AppAdminField =
  typeof AppFieldGroups.admin[number]
export type AppDeveloperField =
  typeof AppFieldGroups.developer[number]
export type AppControlField =
  typeof AppFieldGroups.control[number]
export type AppSystemField =
  typeof AppFieldGroups.system[number]

export type AppCreateInput = Omit<App, 'id' | 'created' | 'updated'>
export type AppUpdateInput = Partial<Omit<App, 'id' | 'created' | 'updated'>>
