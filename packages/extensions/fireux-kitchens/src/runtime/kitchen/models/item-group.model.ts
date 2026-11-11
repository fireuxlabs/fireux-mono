import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

/** Kitchen-owned organisation; names never grant preparation or service behaviour. */
export type KitchenItemGroup = FireuxStamped & {
  id: string
  kitchen_id: string
  name: string
  active: boolean
  sort_order: number
  default_station_ids: string[]
}
