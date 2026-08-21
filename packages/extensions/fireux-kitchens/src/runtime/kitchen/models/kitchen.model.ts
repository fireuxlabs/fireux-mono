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

  fulfilment: {
    modes: KitchenFulfilmentMode[]
    estimated_minutes?: {
      min: number
      max: number
    }
  }
}
