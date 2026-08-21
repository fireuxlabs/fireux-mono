// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: centralize stable fictional identities and timestamps for related Demo records.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: retain stable identities for both original Demo Kitchens.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: name the polished default world Misebox Restaurant.
// Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: add one stable fictional pizzeria identity without changing existing Demo ownership.
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/media/misebox'
import type { KitchenDemoIdentity } from './types'

export const deanosKitchenDemoIdentity = {
  appId: 'misebox-app',
  kitchenId: 'deanos',
  kitchenSlug: 'deanos',
  placeId: 'deanos',
  menuId: 'deanos-menu',
  serviceId: 'deanos-service-2026-07-26',
} as const satisfies KitchenDemoIdentity

export const deanosKitchenDemoTeamMemberIds = [
  'deanos-alex',
  'deanos-sam',
  'deanos-jo',
] as const

export const deanosPartyMenuDemoIdentity = {
  ...deanosKitchenDemoIdentity,
  menuId: 'deanos-party-menu',
} as const satisfies KitchenDemoIdentity

export const deanosXmasMenuDemoIdentity = {
  ...deanosKitchenDemoIdentity,
  menuId: 'deanos-xmas-menu',
} as const satisfies KitchenDemoIdentity

export const miseboxRestaurantKitchenDemoIdentity = {
  appId: 'misebox-app',
  kitchenId: 'misebox-restaurant',
  kitchenSlug: 'misebox-restaurant',
  placeId: 'misebox-restaurant',
  menuId: 'misebox-restaurant-menu',
  serviceId: 'misebox-restaurant-demo-lunch-service',
} as const satisfies KitchenDemoIdentity

export const pizzaTheActionKitchenDemoIdentity = {
  appId: 'misebox-app',
  kitchenId: 'pizza-the-action',
  kitchenSlug: 'pizza-the-action',
  placeId: 'pizza-the-action',
  menuId: 'pizza-the-action-menu',
  serviceId: 'pizza-the-action-demo-evening-service',
} as const satisfies KitchenDemoIdentity

export const kitchenDemoMediaUrl = (kitchenId: string, relativePath: string) =>
  miseboxDemoMediaUrl(`kitchens/${kitchenId}/${relativePath}`)

export const placeDemoMediaUrl = (placeId: string, relativePath: string) =>
  miseboxDemoMediaUrl(`places/${placeId}/${relativePath}`)

export const DEANOS_KITCHEN_DEMO_ORIGIN_ISO = '2025-11-03T09:00:00.000Z'

export const kitchenDemoTimestamp = (iso: string): FirebaseTimestamp => ({
  seconds: Math.floor(Date.parse(iso) / 1000),
  nanoseconds: 0,
})

export const kitchenDemoCreated = (
  identity: KitchenDemoIdentity,
  iso?: string,
  by = 'demo'
) => ({
  at: kitchenDemoTimestamp(
    iso ??
      (identity.kitchenId === deanosKitchenDemoIdentity.kitchenId
        ? DEANOS_KITCHEN_DEMO_ORIGIN_ISO
        : '2026-07-22T09:00:00.000Z')
  ),
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
