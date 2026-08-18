// FILE: packages/extensions/fireux-kitchens/src/runtime/kitchen/models/station.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export interface KitchenStation extends FireuxStamped {
  id: string
  kitchen_id: string
  name: string
  description: string
  active: boolean
  sort_order: number
}

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: /apps/<appId>/kitchens/<kitchenId>/stations/<stationId>
 * Owner: Kitchen through its same-id AppKitchen support record
 *
 * A Station is operational Kitchen configuration. It has a stable local id
 * because Team and Mise records may refer to it, but it has no lifecycle or
 * authority outside its owning Kitchen.
 */
export const KitchenStationStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/stations/{stationId}',
  collection: 'stations',
  parent: 'kitchen',
  idParam: 'stationId',
} as const

export const KitchenStationRecord = defineFireuxEntity({
  kind: 'record',
  name: 'KitchenStation',
  family: ['kitchen', 'support'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  console: false,
  parent: 'Kitchen',
  scoped: KitchenStationStorage.path,
  notes: [
    'Kitchen owns Station configuration and ordering.',
    'Stable Station ids may be referenced by Kitchen-owned Team and Mise records.',
  ],
})

export const KitchenStationDefaults = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  description: '' as string,
  active: true as boolean,
  sort_order: 0 as number,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const satisfies KitchenStation

export type KitchenStationCreateInput = Omit<KitchenStation, 'created' | 'updated'>
export type KitchenStationUpdateInput = Partial<
  Omit<KitchenStation, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

const stationRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const stationString = (value: unknown) => String(value ?? '').trim()

const stationSortOrder = (value: unknown) => {
  const order = Number(value)
  return Number.isInteger(order) && order >= 0 ? order : 0
}

export function normalizeKitchenStation(value: unknown): KitchenStation {
  const source = stationRecord(value)
  const created = stationRecord(source.created)
  const updated = stationRecord(source.updated)

  return {
    ...KitchenStationDefaults,
    id: stationString(source.id),
    kitchen_id: stationString(source.kitchen_id),
    name: stationString(source.name),
    description: stationString(source.description),
    active: source.active !== false,
    sort_order: stationSortOrder(source.sort_order),
    created: Object.keys(created).length
      ? created as unknown as KitchenStation['created']
      : KitchenStationDefaults.created,
    updated: Object.keys(updated).length
      ? updated as unknown as KitchenStation['updated']
      : KitchenStationDefaults.updated,
  }
}
