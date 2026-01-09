/**
 * Company overlay (Place-bound)
 * Firestore: companies/{placeId}
 * - Document ID is the canonical Place ID.
 * - This is an overlay on top of an existing Place.
 */
export interface Company {
  /** Canonical Place ID (also the Firestore document ID). */
  id: string

  /** Display name */
  name: string

  /** Canonical address snapshot */
  formatted_address: string

  /** Canonical location snapshot */
  lat: number
  lng: number

  /** Avatar snapshot (usually places/{id}/avatar storage URL) */
  avatar: string

  /** Optional website */
  website: string

  created_at?: any
  updated_at?: any
  creator_id?: string
}

export type CompanyCreateInput = Omit<Company, 'creator_id' | 'created_at' | 'updated_at'>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
