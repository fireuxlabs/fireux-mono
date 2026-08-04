import type { NuxtConfig } from '@nuxt/schema'
import type { FireuxDesignPackConfig } from './design-packs'
import type { FireuxSeoConfig } from './seo'
import type { FireuxMetaContent } from './meta-content'

export type FireuxAppRole = 'global' | 'tenant' | 'standalone'

export type FireuxConsoleFamilyConfig = {
  canCreate?: boolean
}

export type FireuxConsoleConfig = Record<string, FireuxConsoleFamilyConfig>

export type FireuxAuthCompletionConfig = {
  path: string
  title?: string
  description?: string
  actionLabel?: string
  delayMs?: number
}

export type FireuxAuthOnboardingConfig = {
  title: string
  description?: string
  completeLabel?: string
  skipLabel?: string
}

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
  /** Optional app-owned Firestore database id. Standalone apps should set this. */
  databaseId?: string
  /** Optional public contact/support email shown in shared UI (e.g. footer). */
  contactEmail?: string
  /** Optional Core-owned app presentation preset. Absent means Nuxt UI defaults. */
  designPack?: FireuxDesignPackConfig
  /** Optional app-level surface design packs, e.g. designPacks.publicMenu. */
  designPacks?: Record<string, Record<string, unknown>>
  role: FireuxAppRole
  /** Extra package capability or custom options for default modules. Blog is the baseline App module; Products is explicit. */
  modules?: NonNullable<NuxtConfig['modules']>
  consoles?: string[]
  /** Optional per-console app behavior, e.g. whether this app may create or pin console targets. */
  consoleConfig?: FireuxConsoleConfig
  /** Optional public/admin root domains this app consumes. */
  domains?: string[]
  /** Optional profile identities this app lets users create/manage. */
  profiles?: string[]
  /** Whether a signed-in canonical User may create their own App membership. */
  selfJoinEnabled?: boolean
  /** Initial email-auth mode shown on the shared auth page. */
  authDefaultMode?: 'sign-in' | 'sign-up'
  /** Optional app-owned completion experience after successful authentication. */
  authCompletion?: FireuxAuthCompletionConfig
  /** Optional app-owned onboarding step shown after shared account creation. */
  authOnboarding?: FireuxAuthOnboardingConfig
  /** Optional public/dashboard nav item keys hidden by this app shell. */
  navHiddenKeys?: string[]
  /** App-level presentation overrides for inherited route navigation, keyed by nav key. */
  navOverrides?: FireuxNavOverrides
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}
