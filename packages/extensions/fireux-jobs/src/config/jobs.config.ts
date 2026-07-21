// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: add category and workplace configuration.
export type FireuxJobsConfig = {
  /** Allowed product-neutral category identifiers for new jobs. */
  categories: string[]

  /**
   * Allowed workplace types for this ecosystem/app.
   * These classify the referenced Place without changing its canonical ID.
   */
  workplaces: string[]

  /**
   * Workplace type assigned by the generic Place-backed create flow.
   * Consumers must configure this explicitly before enabling job creation.
   */
  defaultWorkplaceType?: string
}

export const defaultFireuxJobsConfig: FireuxJobsConfig = {
  categories: [],
  workplaces: [],
}
