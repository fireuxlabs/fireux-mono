import type { NuxtConfig } from '@nuxt/schema'
import type { RuntimeAppRole } from './runtime'
import type { FireuxSeoConfig } from './seo'
import type { FireuxMetaContent } from '../../runtime/models/system/meta-content.model'

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
  /** Optional app-level design pack. Surface-specific packs belong in designPacks. */
  designPack?: Record<string, unknown>
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
  /** Optional public/dashboard nav item keys hidden by this app shell. */
  navHiddenKeys?: string[]
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}
