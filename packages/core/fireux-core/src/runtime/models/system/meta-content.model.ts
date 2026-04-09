/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System support
 * Storage: runtime content model, not an app-scoped record
 * Scope: ecosystem app narrative and informational content
 *
 * Decision note:
 * - Meta content supports system delivery but is not part of the main root/overlay/facade entity debate.
 * - It lives with runtime models because the content shape is part of delivered runtime behavior.
 * - If this needs a different home later, update the models README first, then this file.
 */

export type FireuxMetaCta = {
  label: string
  to: string
  icon?: string
  external?: boolean
}

export type FireuxMetaAppIdentity = {
  /** App key (for example: "misebox", "granite", "fireux", "cleanbox", "bringli"). */
  id: string
  /** Human app name (for example: "Misebox"). */
  name: string
  /** Ecosystem key (for example: "misebox", "granite", "fireux"). */
  ecosystem: string
  /** Optional team label. */
  team?: string
}

export type FireuxMetaCopy = {
  /** Big personality headline (can include HTML). */
  big_personality?: string
  /** Secondary headline. */
  headline?: string

  /** Brand/UI emphasis words or short phrases used in hero and landing surfaces. */
  highlight_terms?: string[]

  /** Reusable positioning line(s) (can include HTML). */
  positioning_html?: string
  /** Reusable promise line(s) (can include HTML). */
  promise_html?: string

  /** Line above console buttons (can include HTML). */
  console_bridge_html?: string

  /** About hero paragraph 1. */
  about_p1?: string
  /** About hero paragraph 2. */
  about_p2?: string
}

export type FireuxMetaSeo = {
  /** Primary app/home SEO title. */
  title?: string
  /** Primary app/home SEO description. */
  description?: string
  /** Structured search-intent phrases for SEO/export tooling. */
  keywords?: string[]
  /** Who the app is for. */
  audience?: string[]
  /** Product/category labels for grouping and discovery. */
  categories?: string[]
  /** Single main topic anchor for the app. */
  primary_topic?: string
}

export type FireuxMetaLists = {
  /** Landing hero bullets. */
  hero_bullets?: string[]
  /** About hero tick list. */
  about_ticks?: string[]
  /** Optional extra reusable lists. */
  [key: string]: string[] | undefined
}

export type FireuxMetaEntity = {
  /** Stable identifier (usually the model/entity name). */
  id: string
  /** Human one-liner for this entity. */
  purpose: string
  /** Optional hints for UI badges/tags. */
  tags?: string[]
  /** Optional route for this entity. */
  to?: string
}

export type FireuxMetaExamples = Record<string, unknown>

export type FireuxMetaRoutes = {
  /** Public or SEO-safe routes. */
  public?: string[]
  /** Console or operational routes. */
  console?: string[]
  /** Optional route groupings. */
  [key: string]: string[] | undefined
}

export type FireuxMetaContent = {
  app: FireuxMetaAppIdentity
  copy?: FireuxMetaCopy
  seo?: FireuxMetaSeo

  /**
   * Canonical CTA map used across landing/about/road-map.
   * Keep route choices centralized here.
   */
  cta?: {
    primary?: FireuxMetaCta
    secondary?: FireuxMetaCta
    console?: FireuxMetaCta
    roadmap?: FireuxMetaCta
    [key: string]: FireuxMetaCta | undefined
  }

  lists?: FireuxMetaLists

  /**
   * Conceptual entities for human understanding.
   * This is not the module registry.
   */
  entities?: FireuxMetaEntity[]

  /** Optional relationship map for /about. */
  relations_ascii?: string

  /**
   * Illustrative objects only.
   * Never store personal data, real IDs, secrets, or credentials.
   */
  examples?: FireuxMetaExamples

  routes?: FireuxMetaRoutes
}

/**
 * Helper to keep app meta files typed and consistent:
 * export const metaContent = defineFireuxMeta({ ... })
 */
export function defineFireuxMeta<const T extends FireuxMetaContent>(meta: T): T {
  return meta
}
