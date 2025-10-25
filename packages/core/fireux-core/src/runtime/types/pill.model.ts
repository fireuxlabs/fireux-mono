/** ------------------------------------------------------------------
 *  Pill Protocol
 *  Shared minimal interface for all Pill-like components.
 *  ------------------------------------------------------------------ */
export namespace Pill {
  export interface Props {
    avatar?: string
    initials?: string
    title: string
    subtitle?: string
    badges?: string[]
  }
}
