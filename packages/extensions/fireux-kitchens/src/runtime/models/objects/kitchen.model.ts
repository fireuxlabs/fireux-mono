export interface Kitchen {
  /** Canonical Place ID (also the Firestore document ID). */
  id: string

  name: string
  formatted_address: string
  lat: number
  lng: number
  avatar: string

  /** Optional kitchen-specific details */
  website: string

  created_at?: any
  updated_at?: any
  creator_id?: any
}

export type KitchenCreateInput = Omit<Kitchen, 'creator_id' | 'created_at' | 'updated_at'>
export type KitchenUpdateInput = Partial<Omit<KitchenCreateInput, 'id'>>
