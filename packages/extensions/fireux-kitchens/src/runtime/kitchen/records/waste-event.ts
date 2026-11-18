import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type KitchenWasteReason =
  | 'spoilage'
  | 'preparation'
  | 'overproduction'
  | 'cooking_error'
  | 'returned'
  | 'other'

export type KitchenWasteSource =
  | 'storage'
  | 'prep'
  | 'production'
  | 'service'
  | 'customer_return'
  | 'other'

export type KitchenWasteEvent = FireuxStamped & {
  id: string
  kitchen_id: string
  item_name: string
  quantity: number
  unit: string
  reason: KitchenWasteReason
  source: KitchenWasteSource
  occurred_at: FirebaseTimestamp
  notes: string
}
