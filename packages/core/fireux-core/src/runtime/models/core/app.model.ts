// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts
// Concurrent edit — 2026-07-20 13:08 CEST — Security spine: make self-join explicit and keep admin authority only in AppUser roles.
// Concurrent edit — 2026-07-20 16:15 CEST — Repo Efficiency Pass 1 of 6: type App repo console families.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: declare App identity, database authority, support, and public-read axes.

import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/meta.model'
import type {
  AppConsoleFamily,
  AppDerived,
  AppMedia,
  AppRepoMetadata,
  AppRole,
  AppSize,
  AppSocialLinks,
} from '../utils/app'

/**
 * Entity map: docs/concepts/entities.md
 *
 * Family: System root entity + active runtime singleton
 * Storage: root canonical model
 * Root path: /apps/<appId>
 * Active seam: useApp() resolves FireUXConfig.appId
 * Management face: App Control when apps are managed through FireUX project/app tools
 *
 * Decision note:
 * - App is stored once as canonical system truth.
 * - The current runtime App, a direct Project App, and an Ecosystem App are the
 *   same root App entity in different relationship contexts.
 * - `FireUXConfig.appId` selects the current root App; it does not create a
 *   separate current-App model or storage scope.
 * - Dashboard and control surfaces edit the same root App record.
 * - `fireux/app` is for app shell, context, orchestration, and config helpers; App entity data belongs in the Firestore App stack.
 * - A runtime surface may manage App, but that does not justify a second stored app-scoped record yet.
 * - Canonical App truth lives in its owning database. FireUX platform discovery
 *   consumes an allowlisted directory projection, never a second App entity.
 * - `project_id` is required. `ecosystem_id` is present only when the App belongs
 *   to an Ecosystem; direct Project Apps leave it absent.
 * - If real scoped App state appears later, update the entity map and this
 *   source together.
 */

export type AppStatus = 'draft' | 'active' | 'paused' | 'archived'

export const AppCanonicalStorage = {
  shape: 'public/root',
  path: 'apps/{appId}',
  collection: 'apps',
  idParam: 'appId',
} as const

/** @deprecated Prefer the authority-explicit AppCanonicalStorage name. */
export const AppStorage = AppCanonicalStorage

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
  notes: [
    'App can be the active runtime self and is still a FireUX entity.',
  ],
})

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { [K in keyof T]: WidenLiteral<T[K]> }
  : T

export const AppModel = {
  id: '',

  // Registry + root-entity relationships
  project_id: '',
  ecosystem_id: '',
  database_id: '',
  slug: '',
  status: 'active' as AppStatus,

  // Identity + brand
  app_name: '',
  app_short_name: '',
  role: '' as AppRole,

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
    console_families: [] as AppConsoleFamily[],
    database_id: '',
  } as AppRepoMetadata,

  // Governance
  self_join_enabled: false,
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

type AppModelShape = WidenLiteral<typeof AppModel>
export type AppModel = Omit<AppModelShape, 'ecosystem_id'> & {
  ecosystem_id?: string
}
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
    'role',
    'app_name',
    'app_short_name',
    'self_join_enabled',
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

export type AppCreateInput = Omit<App, 'created' | 'updated'>
export type AppUpdateInput = Partial<Omit<App, 'id' | 'created' | 'updated'>>
