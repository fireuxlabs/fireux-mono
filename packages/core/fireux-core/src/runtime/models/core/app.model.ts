// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { AppDerived, AppMedia, AppRole, AppSocialLinks } from './supporting/app'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System
 * Storage: root canonical model
 * Root path: /apps/<appId>
 * Runtime face: project-managed facade when apps are being handled inside a project runtime surface
 *
 * Decision note:
 * - App is stored once as canonical system truth.
 * - A runtime surface may manage App through a facade, but that does not justify a second stored app-scoped record yet.
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

export type AppCreateInput = Omit<App, 'id' | 'created' | 'updated'>
export type AppUpdateInput = Partial<Omit<App, 'id' | 'created' | 'updated'>>
