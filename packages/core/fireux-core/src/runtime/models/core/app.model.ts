// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { AppRole, AppSocialLinks } from './supporting/app'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System
 * Storage: root canonical model
 * Root path: /apps/<appId>
 * Console face: project-console facade when apps are being managed inside a project console
 *
 * Decision note:
 * - App is stored once as canonical system truth.
 * - A console may manage App through a runtime facade, but that does not justify a second stored overlay yet.
 * - If real scoped stored state appears later, update the models README first, then this file.
 */

export type AppStatus = 'draft' | 'active' | 'paused' | 'archived'

export const App = {
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
  },
  media: {
    thumbnail_url: '',
    logo_url: '',
    wordmark_light_url: '',
    wordmark_dark_url: '',
    cover_url: '',
  },

  // Governance + runtime flags
  join_requests: [],
  admin_ids: [],
  moderation_state: '',
  ban_reasons: [],
  console_enabled: true,

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

export type App = {
  [K in keyof typeof App]: (typeof App)[K]
}

export type AppDoc = Omit<App, 'id'>
export type AppResolved = App
export type AppCreateInput = Omit<App, 'id' | 'created' | 'updated'>
export type AppUpdateInput = Partial<Omit<AppCreateInput, never>>
