import type { Place } from 'fireux-places/runtime/place/models/place.model'

export type KitchenFulfilmentMode =
  | 'delivery'
  | 'collection'
  | 'dine_in'
  | 'takeaway'

export type Kitchen = {
  id: string
  slug: string
  status: 'active' | 'inactive' | 'archived'
  visibility: boolean

  place: Place
  fulfilment: {
    modes: KitchenFulfilmentMode[]
    estimated_minutes?: {
      min: number
      max: number
    }
  }
}
