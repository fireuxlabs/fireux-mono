// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: add category and workplace configuration.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: make canonical Place identity universal across Apps.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: model explicit all-category Apps without inventing an all category id.
export type FireuxJobCategoryScope = 'all' | 'allowlist'

export type FireuxJobCategorySelection = 'all' | string[]

export type FireuxJobsConfig = {
  /** Whether the App accepts every valid product-neutral category identifier. */
  categoryScope: FireuxJobCategoryScope
  /** Allowed product-neutral category identifiers for new jobs. */
  categories: string[]
}

export const defaultFireuxJobsConfig: FireuxJobsConfig = {
  categoryScope: 'allowlist',
  categories: [],
}
