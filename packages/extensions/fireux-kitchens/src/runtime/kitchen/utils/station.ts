import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { KitchenStation } from '../models/station.model'

export type { KitchenStation } from '../models/station.model'

export const KitchenStationStorage = {
  shape: 'scoped', path: 'kitchens/{kitchenId}/stations/{stationId}',
  collection: 'stations', parent: 'kitchen', idParam: 'stationId',
} as const

export const KitchenStationDefaults: KitchenStation = {
  id: '', kitchen_id: '', name: '', description: '', active: true, sort_order: 0,
  created: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['created']['by'], app_id: '' as FireuxStamped['created']['app_id'] },
  updated: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['updated']['by'] },
}

export type KitchenStationCreateInput = Omit<KitchenStation, 'created' | 'updated'>
export type KitchenStationUpdateInput = Partial<Omit<KitchenStation, 'id' | 'created' | 'updated' | 'kitchen_id'>>

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const text = (value: unknown) => String(value ?? '').trim()

export function normalizeKitchenStation(value: unknown): KitchenStation {
  const source = record(value)
  const sortOrder = Number(source.sort_order)
  return {
    ...KitchenStationDefaults,
    id: text(source.id), kitchen_id: text(source.kitchen_id), name: text(source.name),
    description: text(source.description), active: source.active !== false,
    sort_order: Number.isInteger(sortOrder) && sortOrder >= 0 ? sortOrder : 0,
    created: Object.keys(record(source.created)).length ? source.created as KitchenStation['created'] : KitchenStationDefaults.created,
    updated: Object.keys(record(source.updated)).length ? source.updated as KitchenStation['updated'] : KitchenStationDefaults.updated,
  }
}
