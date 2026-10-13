import type { KitchenOrderType } from './offering-interaction-types.model.ts'

export type KitchenFulfilmentMode =
  | 'delivery'
  | 'collection'
  | 'dine_in'
  | 'takeaway'

export type KitchenDeliveryZone = {
  id: string
  label: string
  min_order_chf?: number
  fee_chf?: number
  radius_m?: number
  postal_codes?: string[]
  place_ids?: string[]
  polygon?: Array<{ lat: number; lng: number }>
  color?: string
}

export type KitchenFulfilmentPaymentMethod =
  | 'cash'
  | 'card_at_pickup'
  | 'card_to_driver'
  | 'room_charge'
  | 'online_card'

export type KitchenPaymentRequirement = 'verified_room'

export type KitchenFulfilmentPaymentPolicy = {
  method: KitchenFulfilmentPaymentMethod
  order_types: KitchenOrderType[]
  requirements?: KitchenPaymentRequirement[]
}

export type KitchenFulfilment = {
  delivery_zones: KitchenDeliveryZone[]
  payment_methods: KitchenFulfilmentPaymentPolicy[]
}
