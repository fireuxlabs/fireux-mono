/** ------------------------------------------------------------------
 *  Pill Protocol
 *  Shared minimal interface for all Pill-like components.
 *  ------------------------------------------------------------------ */
export namespace Pill {
  export interface Props {
    avatar?: string | null
    initials?: string
    title?: string | null
    /** Prefer tagline when available. */
    subtitle?: string | null
    tagline?: string | null
    badges?: string[]
    special?: boolean
    specialIcon?: string
    specialTooltip?: string
  }
}
