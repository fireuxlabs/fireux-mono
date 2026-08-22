import { ProfileAppStateStamps } from 'fireux-core/runtime/models/utils/profile.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Driver, DriverAppState } from '../models/driver.model'

export type * from '../models/driver.model'
export const DriverStorage = { shape: 'user-owned', profile: 'users/{userId}/profiles/driver', appState: 'users/{userId}/profiles/driver/app-state/{appId}', collection: 'profiles', document: 'driver', idParam: 'userId' } as const
export const DriverAppStateStorage = { shape: 'scoped', path: DriverStorage.appState, collection: 'app-state', parent: 'driver-profile', idParam: 'appId' } as const
export const DriverDefaults: Driver = { id: '', kind: 'driver', title: '', subtitle: '', tagline: '', tags: [], coverage: { radius_m: 1500 }, created: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['created']['by'] }, updated: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['updated']['by'] } }
export const DriverAppStateDefaults: DriverAppState = { id: '', profile_kind: 'driver', app_id: '', driver_phone: '', accepts_weak_pings: true, accepts_delivery_tenders: true, active_kitchen_ids: [], kitchen_links: [], ...ProfileAppStateStamps }
export type DriverProfilePayload = Pick<Driver, 'title' | 'subtitle' | 'tagline' | 'tags' | 'coverage'>
export type DriverProfile = DriverProfilePayload & Pick<Driver, 'id'>
export type DriverDirectoryProfile = DriverProfile
export type DriverCreateInput = Omit<Driver, 'id' | 'created' | 'updated'>
export type DriverUpdateInput = Partial<Omit<Driver, 'id' | 'created' | 'updated'>>
export function createDriverProfileSeed(): DriverCreateInput { const { id: _id, created: _created, updated: _updated, ...seed } = DriverDefaults; return { ...seed, tags: [], coverage: { ...seed.coverage } } }
export function createDriverAppStateSeed(): Omit<DriverAppState, 'id' | 'profile_kind' | 'app_id' | 'created' | 'updated'> { return { driver_phone: '', accepts_weak_pings: true, accepts_delivery_tenders: true, active_kitchen_ids: [], kitchen_links: [] } }
