// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: make App self-join an explicit bootstrap policy.
import type { NuxtConfig } from '@nuxt/schema'
import type { RuntimeAppRole } from './runtime'
import type { FireuxDesignPackConfig } from './design-packs'
import type { FireuxSeoConfig } from './seo'
import type { FireuxMetaContent } from '../../runtime/models/system/meta-content.model'

export type FireuxAppBrandConfig =
  | { owner: 'core' }
  | { owner: 'ecosystem' }
  | { owner: 'app'; status: 'approved' | 'provisional' }

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
  /** Declares the single authority for the complete /public/img/app runtime family. */
  brand: FireuxAppBrandConfig
  /** Optional app-owned Firestore database id. Standalone apps should set this. */
  databaseId?: string
  /** Optional dedicated service account for the deployed Firebase SSR function. */
  serverFunctionServiceAccount?: string
  /** Optional public contact/support email shown in shared UI (e.g. footer). */
  contactEmail?: string
  /** Optional Core-owned app presentation preset. Absent means Nuxt UI defaults. */
  designPack?: FireuxDesignPackConfig
  /** Optional app-level surface design packs, e.g. designPacks.publicMenu. */
  designPacks?: Record<string, Record<string, unknown>>
  role: RuntimeAppRole
  /** Extra package capability or custom options for default modules. Product and Blog are baseline app modules. */
  modules?: NonNullable<NuxtConfig['modules']>
  consoles?: string[]
  /** Optional per-console app behavior, e.g. whether this app may create or pin console targets. */
  consoleConfig?: Record<
    string,
    { canCreate?: boolean; targetIds?: string[]; devTargetIds?: string[] }
  >
  /** Optional public/admin root domains this app consumes. */
  domains?: string[]
  /** Optional profile identities this app lets users create/manage. */
  profiles?: string[]
  /** Whether a signed-in canonical User may create their own App membership. */
  selfJoinEnabled?: boolean
  /** Initial email-auth mode shown on the shared auth page. */
  authDefaultMode?: 'sign-in' | 'sign-up'
  /** Optional app-owned completion experience after successful authentication. */
  authCompletion?: {
    path: string
    title?: string
    description?: string
    actionLabel?: string
    delayMs?: number
  }
  /** Optional app-owned onboarding step shown after shared account creation. */
  authOnboarding?: {
    title: string
    description?: string
    completeLabel?: string
    skipLabel?: string
  }
  /** Optional public/dashboard nav item keys hidden by this app shell. */
  navHiddenKeys?: string[]
  /** App-level presentation overrides for inherited route navigation, keyed by nav key. */
  navOverrides?: Record<
    string,
    {
      label?: string
      icon?: string
      position?: 'top' | 'middle' | 'bottom'
      order?: number
      desktop?: boolean
      mobile?: boolean
      layouts?: string[]
    }
  >
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}
