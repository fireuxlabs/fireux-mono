import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'

export type KitchenStation = FireuxStamps & {
  id: string
  kitchen_id: string
  name: string
  description: string
  role?: 'preparation' | 'coordination'
  active: boolean
  sort_order: number
}
