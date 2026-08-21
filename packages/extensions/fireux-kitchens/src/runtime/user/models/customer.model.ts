// Registered Customer preferences are User-owned; guest details remain on Order.
// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: own a server-loadable exact private Customer provisioning seed.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: Identity/profile capability.
 * Sibling: chef.model.ts
 * Delta: Customer is optional ordering preferences, not another identity.
 */
export const CustomerStorage = {
  shape: 'user-owned',
  path: 'users/{userId}/profiles/customer',
  collection: 'profiles',
  document: 'customer',
  parent: 'user',
  idParam: 'userId',
} as const

export const CustomerProfileRecord = defineFireuxEntity({
  kind: 'record',
  name: 'CustomerProfile',
  family: ['identity', 'commerce'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  workspace: false,
  parent: 'User',
  scoped: CustomerStorage.path,
  notes: [
    'CustomerProfile stores optional ordering preferences for one User.',
    'User owns person identity; CustomerProfile never becomes another User root.',
  ],
})

export type CustomerSavedAddress = {
  id: string
  label: string
  address: string
  place_id: string
  delivery_note: string
  is_default: boolean
}

export type CustomerPreferences = {
  name: string
  phone: string
  allergy_note: string
  default_delivery_address: string
  saved_addresses: CustomerSavedAddress[]
}

export const CustomerPreferencesDefaults = {
  name: '' as string,
  phone: '' as string,
  allergy_note: '' as string,
  default_delivery_address: '' as string,
  saved_addresses: [] as CustomerSavedAddress[],
} as const satisfies CustomerPreferences

export const CustomerDefaults = {
  id: '' as string,
  kind: 'customer' as const,
  preferences: { ...CustomerPreferencesDefaults } as CustomerPreferences,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Customer = FireuxStamped & {
  id: string
  kind: 'customer'
  preferences: CustomerPreferences
}

export type CustomerCreateInput = Omit<Customer, 'id' | 'created' | 'updated'>
export type CustomerUpdateInput = Partial<
  Omit<Customer, 'id' | 'created' | 'updated'>
>

export function createCustomerProfileSeed(): CustomerCreateInput {
  return {
    preferences: {
      name: CustomerPreferencesDefaults.name,
      phone: CustomerPreferencesDefaults.phone,
      allergy_note: CustomerPreferencesDefaults.allergy_note,
      default_delivery_address:
        CustomerPreferencesDefaults.default_delivery_address,
      saved_addresses: [...CustomerPreferencesDefaults.saved_addresses],
    },
    kind: CustomerDefaults.kind,
  }
}
