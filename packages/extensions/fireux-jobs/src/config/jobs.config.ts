// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: add category and workplace configuration.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: make canonical Place identity universal across Apps.
export type FireuxJobsConfig = {
  /** Allowed product-neutral category identifiers for new jobs. */
  categories: string[]
}

export const defaultFireuxJobsConfig: FireuxJobsConfig = {
  categories: [],
}
