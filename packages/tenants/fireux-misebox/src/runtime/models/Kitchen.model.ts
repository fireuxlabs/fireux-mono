/**
 * Kitchen Model (Misebox)
 * Minimal Firestore shape — id matches place_id.
 */

export interface Kitchen {
  /** Same as place_id (1:1 mapping with Places) */
  id: string
  name: string
  description?: string
  app_id?: string | null
}

/* ---------------------------
 * UI Card View Models (strict)
 * --------------------------- */
export namespace KitchenCard {
  /** Tiny badge-style */
  export interface Pill {
    id: string
    name: string
  }

  /** Mid-size list row */
  export interface Cell {
    id: string
    name: string
    app_id?: string | null
  }

  /** Full profile panel */
  export interface Profile {
    id: string
    name: string
    description?: string
    app_id?: string | null
  }
}
