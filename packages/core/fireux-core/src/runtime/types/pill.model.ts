import type { RouteLocationRaw } from 'vue-router'

/** ------------------------------------------------------------------
 *  Pill Protocol
 *  Shared minimal interface for all Pill-like components.
 *  ------------------------------------------------------------------ */
export namespace Pill {
  export interface Props {
    avatar?: string | null
    initials?: string
    title?: string | null
    /** Prefer tagline; subtitle kept for legacy data sources. */
    subtitle?: string | null
    tagline?: string | null
    badges?: string[]
    to?: RouteLocationRaw | null
    special?: boolean
    specialIcon?: string
    specialTooltip?: string
  }
}
