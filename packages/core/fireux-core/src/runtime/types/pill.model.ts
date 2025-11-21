import type { RouteLocationRaw } from 'vue-router'

/** ------------------------------------------------------------------
 *  Pill Protocol
 *  Shared minimal interface for all Pill-like components.
 *  ------------------------------------------------------------------ */
export namespace Pill {
  export interface Props {
    avatar: string
    initials?: string
    title: string
    /** Prefer tagline; subtitle kept for legacy data sources. */
    subtitle?: string
    tagline?: string
    badges?: string[]
    to?: RouteLocationRaw | null
    special?: boolean
    specialIcon?: string
    specialTooltip?: string
  }
}
