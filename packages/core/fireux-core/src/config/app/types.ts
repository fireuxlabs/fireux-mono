import type { NuxtConfig } from '@nuxt/schema'
import type { FireuxDesignPackConfig } from './design-packs'
import type { FireuxSeoConfig } from './seo'
import type { FireuxMetaContent } from './meta-content'
import type { AppTheme } from '../../types/theme'

export type FireuxAppRole = 'global' | 'tenant' | 'standalone'

export type FireuxConsoleFamilyConfig = {
  canCreate?: boolean
  /** Whether this App exposes the shared Demo target catalogue for this Console. */
  allowDemo?: boolean
}

export type FireuxConsoleConfig = Record<string, FireuxConsoleFamilyConfig>

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
  /** Complete semantic palette confirmed during App onboarding. */
  theme?: AppTheme
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
  /** Optional public/dashboard nav item keys hidden by this app shell. */
  navHiddenKeys?: string[]
  /** App-level presentation overrides for inherited route navigation, keyed by nav key. */
  navOverrides?: FireuxNavOverrides
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}
