// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: centralize stable fictional identities and timestamps for related Demo records.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: retain stable identities for both original Demo Kitchens.
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { KitchenDemoIdentity } from './types'

export const deanosKitchenDemoIdentity = {
  appId: 'misebox-app',
  kitchenId: 'deanos',
  kitchenSlug: 'deanos',
  placeId: 'demo-deanos-place',
  menuId: 'deanos-menu',
  serviceId: 'deanos-demo-lunch-service',
} as const satisfies KitchenDemoIdentity

export const gardenRoomKitchenDemoIdentity = {
  appId: 'misebox-app',
  kitchenId: 'garden-room',
  kitchenSlug: 'garden-room',
  placeId: 'demo-garden-room-place',
  menuId: 'garden-room-menu',
  serviceId: 'garden-room-demo-lunch-service',
} as const satisfies KitchenDemoIdentity

export const kitchenDemoAssetBase = '/img/showcase/menu'

export const kitchenDemoTimestamp = (iso: string): FirebaseTimestamp => ({
  seconds: Math.floor(Date.parse(iso) / 1000),
  nanoseconds: 0,
})

export const kitchenDemoCreated = (
  identity: KitchenDemoIdentity,
  iso = '2026-07-22T09:00:00.000Z',
  by = 'demo'
) => ({
  at: kitchenDemoTimestamp(iso),
  by,
  app_id: identity.appId,
})

export const kitchenDemoUpdated = (
  iso = '2026-07-22T09:00:00.000Z',
  by = 'demo'
) => ({
  at: kitchenDemoTimestamp(iso),
  by,
})
