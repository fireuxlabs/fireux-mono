// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: make Customer an app-private ordering record.
// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: own a server-loadable exact private Customer provisioning seed.
import type { AppProfileBase } from 'fireux-core/runtime/models/core/profile.model.ts'
import { AppProfileStamps } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: Identity/profile capability.
 * Sibling: chef.model.ts
 * Delta: Customer is private ordering identity, not a public profile surface.
 */
export const CustomerStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/customers/{userId}',
  collection: 'customers',
  parent: 'app',
  idParam: 'userId',
} as const

export const AppCustomerStorage = CustomerStorage

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
  // This whole record is app-private; the nested shape keeps ordering fields
  // out of generic identity/card projections.
  private: { ...CustomerPrivateModel } as CustomerPrivate,
  ...AppProfileStamps,
} as const

export type Customer = AppProfileBase & {
  private: CustomerPrivate
}

export const AppCustomerModel = CustomerModel

export type AppCustomer = Customer

export type CustomerCreateInput = Omit<Customer, 'id' | 'created' | 'updated'>
export type CustomerUpdateInput = Partial<
  Omit<Customer, 'id' | 'created' | 'updated'>
>

export function createAppCustomerProfileSeed(): CustomerCreateInput {
  return {
    private: {
      name: CustomerPrivateModel.name,
      phone: CustomerPrivateModel.phone,
      allergy_note: CustomerPrivateModel.allergy_note,
      default_delivery_address: CustomerPrivateModel.default_delivery_address,
      saved_addresses: [...CustomerPrivateModel.saved_addresses],
      order_history: [...CustomerPrivateModel.order_history],
    },
  }
}
