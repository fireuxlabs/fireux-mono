/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Shared protocol
 * Storage: reusable runtime contract, not a persisted entity
 * Used by: pill-like display components across FireUX
 *
 * Decision note:
 * - This file lives under runtime/models because it is a small shared display protocol used alongside runtime entity models.
 * - It is support for the model layer, not a canonical root or scoped entity.
 * - If this stops being model-adjacent later, update the models README first, then move it deliberately.
 */
/** ------------------------------------------------------------------
 *  Pill Protocol
 *  Shared minimal interface for all Pill-like components.
 *  ------------------------------------------------------------------ */
export namespace Pill {
  export interface Props {
    avatar?: string | null
    avatarSecondary?: string | null
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
