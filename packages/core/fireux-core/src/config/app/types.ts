import type { NuxtConfig } from '@nuxt/schema'
import type { FireuxSeoConfig } from './seo-config'
import type { FireuxMetaContent } from '../../runtime/app/literature/types'
import type { AppRole } from '../../runtime/app/models/model'

export type FireuxWorkspaceFamilyConfig = {
  /** Optional App-owned origin for this Workspace entrance. Home remains route-owned. */
  origin?: string
  canCreate?: boolean
  /** Whether this App exposes the shared Demo target catalogue for this Workspace. */
  allowDemo?: boolean
}

export type FireuxWorkspaceConfig = Record<string, FireuxWorkspaceFamilyConfig>

export type FireuxAppSubscriptionCapacityLimit = {
  free: number | null
  pro: number | null
  business: number | null
}

export type FireuxAppSubscriptionCapacity = Record<
  string,
  FireuxAppSubscriptionCapacityLimit
>

/** Authored App assembly input; public presentation lives in app.config.ts. */
export type FireuxAppConfig = {
  /** Ecosystem package/Firebase binding key. This is infrastructure, not an entity relationship. */
  ecosystem: string
  /** Canonical FireUX Project entity id. */
  projectId: string
  /** Canonical Ecosystem entity id that owns this App relationship. */
  ecosystemId: string
  id: string
  name: string
  shortName: string
  /** Initial operator context; server-only and used only when creating the App. */
  context?: string
  /** Public Home navigation destination. Native index routes own initial arrival. Defaults to `/`. */
  homePath?: `/${string}`
  /** Optional app-owned Firestore database id. Standalone apps should set this. */
  databaseId?: string
  /** Optional public contact/support email shown in shared UI (e.g. footer). */
  contactEmail?: string
  /** Optional app-level surface design packs, e.g. designPacks.publicMenu. */
  designPacks?: Record<string, Record<string, unknown>>
  role: AppRole
  /** Extra capabilities or custom options for the standard Core, Blogs, Products and AI modules. */
  modules?: NonNullable<NuxtConfig['modules']>
  /** Native Nuxt layers, in App-owned priority order. */
  extends?: NuxtConfig['extends']
  workspaces?: string[]
  /** Optional per-workspace app behavior, e.g. whether this app may create or pin workspace targets. */
  workspaceConfig?: FireuxWorkspaceConfig
  /** App-owned limits keyed by capability, e.g. `kitchen.team`. Null means unlimited. */
  subscriptionCapacity?: FireuxAppSubscriptionCapacity
  /** Optional public/admin root domains this app consumes. */
  domains?: string[]
  /** Optional profile identities this app lets users create/manage. */
  profiles?: string[]
  /** Whether this App installs Firebase Authentication. Defaults to true. */
  authEnabled?: boolean
  /** Secret Manager environment names attached only to this App's Firebase server function. */
  firebaseSecrets?: string[]
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}
