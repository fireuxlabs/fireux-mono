import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type KitchenStation = FireuxStamped & {
  id: string
  kitchen_id: string
  name: string
  description: string
  active: boolean
  sort_order: number
}
