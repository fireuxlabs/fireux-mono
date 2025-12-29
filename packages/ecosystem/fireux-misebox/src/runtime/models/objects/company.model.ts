/**
 * Company Model (Misebox)
 * Minimal Firestore shape — id matches place_id.
 */

export interface Company {
  /** Same as place_id (1:1 mapping with Places) */
  id: string
  name: string
  description?: string
  app_id?: string | null
}
