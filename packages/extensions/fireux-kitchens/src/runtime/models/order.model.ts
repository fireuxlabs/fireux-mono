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

  // Legacy flat fields still written by some order mutations.
  app_id: '' as string,
  creator_id: '' as string,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export type KitchenOrder = {
  [K in keyof typeof KitchenOrder]: (typeof KitchenOrder)[K]
}

export type KitchenOrderCreateInput = Omit<
  KitchenOrder,
  'created' | 'updated'
>
