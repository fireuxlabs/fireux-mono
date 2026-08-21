/**
 * Authored App literature supplied through `defineFireuxConfig`.
 * This is configuration input, not a persisted model or route registry.
 */

export type FireuxMetaCta = {
  label: string
  to: string
  icon?: string
  external?: boolean
}

export type FireuxMetaSolutionStatus =
  | 'live'
  | 'very-easy'
  | 'coming-soon'
  | 'bridge'
  | 'planned'
  | 'later'

export type FireuxMetaRelatedApp = {
  name: string
  to: string
  description?: string
  external?: boolean
}

export type FireuxMetaSolutionOwner = {
  id: string
  name: string
  to?: string
}

export type FireuxMetaChecklistItem = {
  label: string
  done?: boolean
}

export type FireuxMetaOperationWorkspace = {
  /** Stable workspace key used for grouping and the /operations anchor. */
  id: string
  /** Human-facing workspace name. */
  name: string
  /** Working workspace root route. */
  to: string
}

export type FireuxMetaOperation = {
  /** Stable Operation key, independent of its current route. */
  id: string
  /** Optional app-wide child key used at /operations/:slug. */
  slug?: string
  /** Direct product language, not an SEO title. */
  title: string
  /** Search-language name for the customer job represented by this Operation. */
  headline?: string
  /** Factual description of what the current surface provides. */
  description: string
  /** Working workspace route that proves the operation. */
  to: string
  /** Workspace that owns the operation. */
  workspace: FireuxMetaOperationWorkspace
  icon?: string
  /** Search-intent phrases used to map operator demand into product literature. */
  keywords?: string[]
  /** Authored research notes that explain what the search phrases ask the product to provide. */
  guidingLiterature?: {
    summary: string
    needs: string[]
  }
}

export type FireuxMetaSolution = {
  /** URL-safe child key used at /solutions/:slug. */
  slug: string
  /** Human-facing solution title. */
  title: string
  /** Short card and SEO description. */
  description: string
  /** Optional Nuxt Icon name. */
  icon?: string
  /** Product status for the current app's solution page. */
  status?: FireuxMetaSolutionStatus
  /** Optional page body copy for the shared boilerplate page. */
  body?: string
  /** Short implementation/use-flow notes shown on the shared boilerplate page. */
  steps?: string[]
  /** Optional admin-only business case notes for planning and fulfillment. */
  businessCase?: string
  /** Optional admin-only provisioning checklist for the tool/workflow behind the solution. */
  provisioning?: string[]
  /** Optional admin-only fulfillment checklist for shipping the solution. */
  checklist?: FireuxMetaChecklistItem[]
  /** Optional sibling app or product that owns the deeper workflow. */
  relatedApp?: FireuxMetaRelatedApp
  /** Optional solution-specific action. Defaults to /solutions/:slug. */
  cta?: FireuxMetaCta
  /** Optional search intent phrases for export/search tooling. */
  keywords?: string[]
  /** Ecosystem or app that owns the canonical solution. */
  owner?: FireuxMetaSolutionOwner
  /** Optional canonical destination when this catalogue is composed by a parent app. */
  to?: string
  /** Open the canonical destination outside the current app. */
  external?: boolean
  /** Prefer this solution in compact landing-page previews. */
  featured?: boolean
}

export type FireuxMetaAppIdentity = {
  /** App key (for example: "misebox", "granite", "fireux", "werkbox", "bringli"). */
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

  /** Line above operational buttons (can include HTML). */
  workspace_bridge_html?: string

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
  /** @deprecated App meta is no longer the route registry. Use app registries, pages, and routing docs instead. Public or SEO-safe routes. */
  public?: string[]
  /** Operational routes. */
  workspace?: string[]
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
    workspace?: FireuxMetaCta
    roadmap?: FireuxMetaCta
    [key: string]: FireuxMetaCta | undefined
  }

  lists?: FireuxMetaLists

  /**
   * Factual index of entity-specific Workspace Operations.
   * Index, Overview, Identity, Team, and Notifications are baked-in Workspace
   * capabilities and never enter this list. Operations are not SEO solution
   * pages or generic tools.
   */
  operations?: FireuxMetaOperation[]

  /**
   * Authored SEO/segue pages.
   * Solutions are not domains, products, or stored entities.
   */
  solutions?: FireuxMetaSolution[]

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

  /** @deprecated App meta is product language/identity, not route canon. */
  routes?: FireuxMetaRoutes
}
