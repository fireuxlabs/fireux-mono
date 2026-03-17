import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type OrderServiceMode = 'dine_in' | 'collection' | 'delivery'

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'in_progress'
  | 'ready'
  | 'completed'
  | 'cancelled'

export type OrderChannel = 'menu' | 'qr' | 'staff' | 'api'

export type OrderScopeType = 'kitchen' | 'product' | string

export type OrderLine = {
  dish_id: string
  label: string
  price_minor: number
  currency_code: string
  qty: number
}

export type OrderService = {
  mode: OrderServiceMode
  table_label?: string
  notes?: string
}

export type OrderCustomer = {
  name?: string
  phone?: string
}

export type OrderTotals = {
  subtotal_minor: number
  currency_code: string
}

export const Order = {
  id: '' as string,
  app_id: '' as FireuxStamped['created']['app_id'],

  scope_type: '' as OrderScopeType,
  scope_id: '' as string,

  // Deprecated fields retained temporarily for migration compatibility.
  kitchen_id: '' as string,
  place_id: '' as string,

  status: 'submitted' as OrderStatus,
  channel: 'menu' as OrderChannel,

  service: {
    mode: 'dine_in',
    table_label: '',
    notes: '',
  } as OrderService,

  customer: {
    name: '',
    phone: '',
  } as OrderCustomer,

  lines: [] as OrderLine[],

  totals: {
    subtotal_minor: 0,
    currency_code: 'CHF',
  } as OrderTotals,

  created: {
    at: {} as FirebaseTimestamp,
  },
  updated: {
    at: {} as FirebaseTimestamp,
  },
} as const

export type Order = {
  [K in keyof typeof Order]: (typeof Order)[K]
}

export type OrderCreateInput = Omit<Order, 'app_id' | 'created' | 'updated'>
