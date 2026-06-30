// Profile family canon: docs/concepts/entities.md
import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { AppProfileBase } from 'fireux-core/runtime/models/core/profile.model'
import { AppProfileStamps } from 'fireux-core/runtime/models/core/profile.model'
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

/**
 * Family: Identity/profile capability.
 * Sibling: customer.model.ts
 * Delta: Driver marks a human who can accept delivery work; fleet, car, and
 * tender state belongs to kitchen fulfilment/order layers, not this profile.
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

export const DriverModel = {
  id: '' as string,
  title: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  tags: [] as string[],

  driver_name: '' as string,
  driver_phone: '' as string,
  accepts_weak_pings: true as boolean,
  accepts_delivery_tenders: true as boolean,
  kitchen_links: [] as DriverKitchenLink[],
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
} as const

export type Driver = {
  [K in keyof typeof DriverModel]: (typeof DriverModel)[K]
}

export const AppDriverModel = {
  id: '' as string,
  driver_name: '' as string,
  driver_phone: '' as string,
  accepts_weak_pings: true as boolean,
  accepts_delivery_tenders: true as boolean,
  kitchen_links: [] as DriverKitchenLink[],
  ...AppProfileStamps,
} as const

export type AppDriver = AppProfileBase &
  Partial<
    Pick<
      Driver,
      | 'driver_name'
      | 'driver_phone'
      | 'accepts_weak_pings'
      | 'accepts_delivery_tenders'
      | 'kitchen_links'
    >
  >

export type DriverCreateInput = Omit<Driver, 'id' | 'created' | 'updated'>
export type DriverUpdateInput = Partial<
  Omit<Driver, 'id' | 'created' | 'updated'>
>
