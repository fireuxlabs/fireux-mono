// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: expose a server-owned Driver kitchen authorization index beside operational links.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: keep Driver storage domain-only and join canonical User by uid.
// Concurrent edit — 2026-07-20 17:43 CEST — Repo Efficiency Pass 2 of 6: own exact root and App Driver provisioning seeds.
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { ProfileAppStateBase } from 'fireux-core/runtime/models/utils/profile.model'
import { ProfileAppStateStamps } from 'fireux-core/runtime/models/utils/profile.model'
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type DriverKitchenLink = {
  app_id: string
  kitchen_id: string
  kitchen_slug: string
  kitchen_name: string
  relation: 'exclusive' | 'preferred' | 'available'
  active: boolean
}

export type DriverCoverage = {
  radius_m: number
}

export type Driver = FireuxStamped & {
  id: string
  kind: 'driver'
  title: string
  subtitle: string
  tagline: string
  tags: string[]
  coverage: DriverCoverage
}

export type DriverAppState = ProfileAppStateBase & {
  driver_phone: string
  accepts_weak_pings: boolean
  accepts_delivery_tenders: boolean
  active_kitchen_ids: string[]
  kitchen_links: DriverKitchenLink[]
}

/**
 * Family: Identity/profile capability.
 * Sibling: customer.model.ts
 * Delta: Driver marks a human who can accept delivery work. Capability lives
 * in the User-owned profile; App-specific contact and tender preferences live
 * below that profile.
 */
export const DriverStorage = {
  shape: 'user-owned',
  profile: 'users/{userId}/profiles/driver',
  appState: 'users/{userId}/profiles/driver/app-state/{appId}',
  collection: 'profiles',
  document: 'driver',
  idParam: 'userId',
} as const

export const DriverAppStateStorage = {
  shape: 'scoped',
  path: DriverStorage.appState,
  collection: 'app-state',
  parent: 'driver-profile',
  idParam: 'appId',
} as const

export const DriverProfileRecord = defineFireuxEntity({
  kind: 'record',
  name: 'DriverProfile',
  family: ['identity', 'profile', 'kitchen'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  workspace: false,
  parent: 'User',
  scoped: DriverStorage.profile,
  notes: ['User owns person identity; DriverProfile owns delivery capability.'],
})

export const DriverAppStateRecord = defineFireuxEntity({
  kind: 'record',
  name: 'DriverAppState',
  family: ['identity', 'profile', 'kitchen'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  workspace: false,
  parent: 'User',
  scoped: DriverAppStateStorage.path,
  notes: [
    'DriverAppState owns App-specific contact and tender state without granting Kitchen authority.',
  ],
})

export const DriverDefaults = {
  id: '' as string,
  kind: 'driver' as const,
  title: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  tags: [] as string[],
  coverage: {
    radius_m: 1500,
  } as DriverCoverage,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const satisfies Driver

export type DriverProfilePayload = Pick<
  Driver,
  'title' | 'subtitle' | 'tagline' | 'tags' | 'coverage'
>
export type DriverProfile = DriverProfilePayload & Pick<Driver, 'id'>
export type DriverDirectoryProfile = DriverProfile

export const DriverAppStateDefaults = {
  id: '' as string,
  profile_kind: 'driver' as const,
  app_id: '' as string,
  driver_phone: '' as string,
  accepts_weak_pings: true as boolean,
  accepts_delivery_tenders: true as boolean,
  // Server-owned authorization index derived from kitchen_links.
  active_kitchen_ids: [] as string[],
  kitchen_links: [] as DriverKitchenLink[],
  ...ProfileAppStateStamps,
} as const satisfies DriverAppState

export type DriverCreateInput = Omit<Driver, 'id' | 'created' | 'updated'>
export type DriverUpdateInput = Partial<
  Omit<Driver, 'id' | 'created' | 'updated'>
>

export function createDriverProfileSeed(): DriverCreateInput {
  return {
    title: DriverDefaults.title,
    kind: DriverDefaults.kind,
    subtitle: DriverDefaults.subtitle,
    tagline: DriverDefaults.tagline,
    tags: [...DriverDefaults.tags],
    coverage: { ...DriverDefaults.coverage },
  }
}

export function createDriverAppStateSeed(): Omit<
  DriverAppState,
  'id' | 'profile_kind' | 'app_id' | 'created' | 'updated'
> {
  return {
    driver_phone: DriverAppStateDefaults.driver_phone,
    accepts_weak_pings: DriverAppStateDefaults.accepts_weak_pings,
    accepts_delivery_tenders: DriverAppStateDefaults.accepts_delivery_tenders,
    active_kitchen_ids: [...DriverAppStateDefaults.active_kitchen_ids],
    kitchen_links: [...DriverAppStateDefaults.kitchen_links],
  }
}
