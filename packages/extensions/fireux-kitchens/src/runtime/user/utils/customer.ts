import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Customer, CustomerPreferences } from '../models/customer.model'

export type * from '../models/customer.model'
export const CustomerStorage = { shape: 'user-owned', path: 'users/{userId}/profiles/customer', collection: 'profiles', document: 'customer', parent: 'user', idParam: 'userId' } as const
export const CustomerPreferencesDefaults: CustomerPreferences = { name: '', phone: '', allergy_note: '', default_delivery_address: '', saved_addresses: [] }
export const CustomerDefaults: Customer = { id: '', kind: 'customer', preferences: { ...CustomerPreferencesDefaults }, created: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['created']['by'] }, updated: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['updated']['by'] } }
export type CustomerCreateInput = Omit<Customer, 'id' | 'created' | 'updated'>
export type CustomerUpdateInput = Partial<Omit<Customer, 'id' | 'created' | 'updated'>>
export function createCustomerProfileSeed(): CustomerCreateInput { return { kind: 'customer', preferences: { ...CustomerPreferencesDefaults, saved_addresses: [] } } }
