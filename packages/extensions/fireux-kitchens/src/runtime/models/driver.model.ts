// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: expose a server-owned Driver kitchen authorization index beside operational links.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: keep Driver storage domain-only and join canonical User by uid.
// Concurrent edit — 2026-07-20 17:43 CEST — Repo Efficiency Pass 2 of 6: own exact root and App Driver provisioning seeds.
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { AppProfileBase } from 'fireux-core/runtime/models/utils/profile.model'
import { AppProfileStamps } from 'fireux-core/runtime/models/utils/profile.model'
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
  title: string
  subtitle: string
  tagline: string
  tags: string[]
  coverage: DriverCoverage
}

export type AppDriver = AppProfileBase & {
  driver_phone: string
  accepts_weak_pings: boolean
  accepts_delivery_tenders: boolean
  active_kitchen_ids: string[]
  kitchen_links: DriverKitchenLink[]
}

/**
 * Family: Identity/profile capability.
 * Sibling: customer.model.ts
 * Delta: Driver marks a human who can accept delivery work. Public capability
 * lives at the root; current-App contact, tender preferences, and kitchen
 * relationships live only in the app-scoped operational record.
 */
export const DriverStorage = {
  shape: 'both',
  root: 'drivers/{userId}',
  overlay: 'apps/{appId}/drivers/{userId}',
  rootCollection: 'drivers',
  overlayCollection: 'drivers',
  idParam: 'userId',
} as const

export const AppDriverStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/drivers/{userId}',
  collection: 'drivers',
  parent: 'app',
  idParam: 'userId',
} as const

export const DriverProfileRecord = defineFireuxEntity({
  kind: 'record',
  name: 'DriverProfile',
  family: ['identity', 'profile', 'kitchen'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'projection',
  status: 'confirmed',
  console: false,
  parent: 'User',
  scoped: DriverStorage.root,
  notes: [
    'User owns person identity; DriverProfile owns delivery capability.',
  ],
})

export const AppDriverProfileRecord = defineFireuxEntity({
  kind: 'record',
  name: 'AppDriverProfile',
  family: ['identity', 'profile', 'kitchen'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  status: 'confirmed',
  console: false,
  parent: 'User',
  scoped: AppDriverStorage.path,
  notes: [
    'AppDriverProfile owns App-specific contact, tender, and Kitchen relationship state.',
  ],
})

export const DriverDefaults = {
  id: '' as string,
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

export type PublicDriverProfilePayload = Pick<
  Driver,
  'title' | 'subtitle' | 'tagline' | 'tags' | 'coverage'
>
export type PublicDriverProfile = PublicDriverProfilePayload &
  Pick<Driver, 'id'>
export type PublicDriverDirectoryProfile = PublicDriverProfile

export const AppDriverDefaults = {
  id: '' as string,
  driver_phone: '' as string,
  accepts_weak_pings: true as boolean,
  accepts_delivery_tenders: true as boolean,
  // Server-owned authorization index derived from kitchen_links.
  active_kitchen_ids: [] as string[],
  kitchen_links: [] as DriverKitchenLink[],
  ...AppProfileStamps,
} as const satisfies AppDriver

export type DriverCreateInput = Omit<Driver, 'id' | 'created' | 'updated'>
export type DriverUpdateInput = Partial<
  Omit<Driver, 'id' | 'created' | 'updated'>
>

export function createDriverProfileSeed(): DriverCreateInput {
  return {
    title: DriverDefaults.title,
    subtitle: DriverDefaults.subtitle,
    tagline: DriverDefaults.tagline,
    tags: [...DriverDefaults.tags],
    coverage: { ...DriverDefaults.coverage },
  }
}

export function createAppDriverProfileSeed(): Omit<
  AppDriver,
  'id' | 'created' | 'updated'
> {
  return {
    driver_phone: AppDriverDefaults.driver_phone,
    accepts_weak_pings: AppDriverDefaults.accepts_weak_pings,
    accepts_delivery_tenders: AppDriverDefaults.accepts_delivery_tenders,
    active_kitchen_ids: [...AppDriverDefaults.active_kitchen_ids],
    kitchen_links: [...AppDriverDefaults.kitchen_links],
  }
}
