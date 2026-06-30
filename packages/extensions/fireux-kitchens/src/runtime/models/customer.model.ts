// Profile family canon: docs/concepts/entities.md
import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { AppProfileBase } from 'fireux-core/runtime/models/core/profile.model'
import { AppProfileStamps } from 'fireux-core/runtime/models/core/profile.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: Identity/profile capability.
 * Sibling: chef.model.ts
 * Delta: Customer is private ordering identity, not a public profile surface.
 */
export const CustomerStorage = {
  shape: 'both',
  root: 'customers/{userId}',
  overlay: 'apps/{appId}/customers/{userId}',
  rootCollection: 'customers',
  overlayCollection: 'customers',
  idParam: 'userId',
} as const

export const AppCustomerStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/customers/{userId}',
  collection: 'customers',
  parent: 'app',
  idParam: 'userId',
} as const

export type CustomerSavedAddress = {
  id: string
  label: string
  address: string
  place_id: string
  delivery_note: string
  is_default: boolean
}

export type CustomerOrderHistoryItem = {
  order_id: string
  app_id: string
  kitchen_id: string
  kitchen_name: string
  ordered_at?: FirebaseTimestamp
  total_cents?: number
  status?: string
}

export type CustomerPrivate = {
  name: string
  phone: string
  allergy_note: string
  default_delivery_address: string
  saved_addresses: CustomerSavedAddress[]
  order_history: CustomerOrderHistoryItem[]
}

export const CustomerPrivateModel = {
  name: '' as string,
  phone: '' as string,
  allergy_note: '' as string,
  default_delivery_address: '' as string,
  saved_addresses: [] as CustomerSavedAddress[],
  order_history: [] as CustomerOrderHistoryItem[],
} as const satisfies CustomerPrivate

export const CustomerModel = {
  id: '' as string,
  title: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  tags: [] as string[],

  // Personal ordering data is intentionally behind `private` so generic
  // profile cards/pills cannot accidentally render address or contact details.
  private: { ...CustomerPrivateModel } as CustomerPrivate,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Customer = {
  [K in keyof typeof CustomerModel]: (typeof CustomerModel)[K]
}

export const AppCustomerModel = {
  id: '' as string,
  private: { ...CustomerPrivateModel } as CustomerPrivate,
  ...AppProfileStamps,
} as const

export type AppCustomer = AppProfileBase &
  Partial<Pick<Customer, 'private'>>

export type CustomerCreateInput = Omit<Customer, 'id' | 'created' | 'updated'>
export type CustomerUpdateInput = Partial<
  Omit<Customer, 'id' | 'created' | 'updated'>
>
