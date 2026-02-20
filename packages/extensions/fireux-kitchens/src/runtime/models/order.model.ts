import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type KitchenOrderItem = {
  id: string
  dish_id: string
  label: string
  quantity: number
  checked: boolean
}

export const KitchenOrder = {
  id: '' as string,
  kitchen_id: '' as string,

  order_number: '' as string,
  status: 'open' as string,
  channel: '' as string,

  items: [] as KitchenOrderItem[],

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenOrder = {
  [K in keyof typeof KitchenOrder]: (typeof KitchenOrder)[K]
}

export type KitchenOrderCreateInput = Omit<
  KitchenOrder,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
