// Profile family canon: docs/concepts/entities.md
import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { AppProfileBase } from 'fireux-core/runtime/models/core/profile.model'
import { AppProfileStamps } from 'fireux-core/runtime/models/core/profile.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: Identity/profile capability.
 * Sibling: profiles/Chef/Chef.model.ts
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

export const CustomerModel = {
  id: '' as string,
  title: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  tags: [] as string[],

  customer_name: '' as string,
  customer_phone: '' as string,
  allergy_note: '' as string,
  default_delivery_address: '' as string,

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
  customer_name: '' as string,
  customer_phone: '' as string,
  allergy_note: '' as string,
  default_delivery_address: '' as string,
  ...AppProfileStamps,
} as const

export type AppCustomer = AppProfileBase &
  Partial<
    Pick<
      Customer,
      | 'customer_name'
      | 'customer_phone'
      | 'allergy_note'
      | 'default_delivery_address'
    >
  >

export type CustomerCreateInput = Omit<Customer, 'id' | 'created' | 'updated'>
export type CustomerUpdateInput = Partial<
  Omit<Customer, 'id' | 'created' | 'updated'>
>
