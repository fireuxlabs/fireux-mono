import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import type { KitchenItemGroup } from '../models/item-group.model'

export function readItemReferenceIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is string =>
              typeof id === 'string' && isFirestoreDocumentId(id)
          )
        ),
      ]
    : []
}
export function validateItemReferenceIds(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length > 50 ||
    value.some((id) => typeof id !== 'string' || !isFirestoreDocumentId(id))
  )
    throw new Error('Choose up to 50 valid Kitchen records.')
  return [...new Set(value)]
}
export function normalizeKitchenItemGroup(
  value: KitchenItemGroup
): KitchenItemGroup {
  return {
    ...value,
    name: String(value.name || '').trim(),
    active: value.active !== false,
    sort_order: Number.isSafeInteger(value.sort_order) ? value.sort_order : 0,
    default_station_ids: readItemReferenceIds(value.default_station_ids),
  }
}
/** Missing override inherits group defaults; an explicit [] means no preparation. */
export function resolveItemPreparationStations(
  item: { group_ids?: string[]; preparation_station_ids?: string[] },
  groups: KitchenItemGroup[]
): string[] {
  if (item.preparation_station_ids !== undefined)
    return readItemReferenceIds(item.preparation_station_ids)
  const selected = new Set(item.group_ids || [])
  return [
    ...new Set(
      groups
        .filter((group) => group.active && selected.has(group.id))
        .flatMap((group) => group.default_station_ids)
    ),
  ]
}
