import type { NuxtConfig } from '@nuxt/schema'
import type { FireuxSeoConfig } from './seo'
import type { FireuxMetaContent } from './meta-content'
import type { AppTheme } from '../../types/theme'

export type FireuxAppRole = 'global' | 'tenant' | 'standalone'

export type FireuxWorkspaceFamilyConfig = {
  canCreate?: boolean
  /** Whether this App exposes the shared Demo target catalogue for this Workspace. */
  allowDemo?: boolean
}

export type FireuxWorkspaceConfig = Record<string, FireuxWorkspaceFamilyConfig>

export type FireuxAppSubscriptionCapacityLimit = {
  free: number | null
  premium: number | null
  business: number | null
}

export type FireuxAppSubscriptionCapacity = Record<
  string,
  FireuxAppSubscriptionCapacityLimit
>

export type FireuxNavOverride = {
  label?: string
  icon?: string
  position?: 'top' | 'middle' | 'bottom'
  order?: number
  desktop?: boolean
  mobile?: boolean
  layouts?: string[]
}

export type FireuxNavOverrides = Record<string, FireuxNavOverride>

export type FireuxAppConfig = {
  /** Ecosystem package/Firebase binding key. This is infrastructure, not an entity relationship. */
  ecosystem: string
  /** Canonical FireUX Project entity id. */
  projectId: string
  /** Canonical Ecosystem entity id when this App belongs to one. */
  ecosystemId?: string
  id: string
  name: string
  shortName: string
  /** App-shell home route. Defaults to `/`. */
  homePath?: `/${string}`
  /** Complete semantic palette confirmed during App onboarding. */
  theme?: AppTheme
  /** Optional app-owned Firestore database id. Standalone apps should set this. */
  databaseId?: string
  /** Optional public contact/support email shown in shared UI (e.g. footer). */
  contactEmail?: string
  /** Optional app-level surface design packs, e.g. designPacks.publicMenu. */
  designPacks?: Record<string, Record<string, unknown>>
  role: FireuxAppRole
  /** Extra package capability or custom options for default modules. Blog is the baseline App module; Products is explicit. */
  modules?: NonNullable<NuxtConfig['modules']>
  workspaces?: string[]
  /** Optional per-workspace app behavior, e.g. whether this app may create or pin workspace targets. */
  workspaceConfig?: FireuxWorkspaceConfig
  /** App-owned limits keyed by capability, e.g. `kitchen.team`. Null means unlimited. */
  subscriptionCapacity?: FireuxAppSubscriptionCapacity
  /** Optional public/admin root domains this app consumes. */
  domains?: string[]
  /** Optional profile identities this app lets users create/manage. */
  profiles?: string[]
  /** Whether a signed-in canonical User may create their own App membership. */
  selfJoinEnabled?: boolean
  /** Whether this App installs Firebase Authentication. Defaults to true. */
  authEnabled?: boolean
  /** Secret Manager environment names attached only to this App's Firebase server function. */
  firebaseSecrets?: string[]
  /** Optional public/dashboard nav item keys hidden by this app shell. */
  navHiddenKeys?: string[]
  /** App-level presentation overrides for inherited route navigation, keyed by nav key. */
  navOverrides?: FireuxNavOverrides
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}
