import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { requireKitchenInteractionChanges } from './interaction-validation'
import { normalizeKitchenOfferings } from './offering-policy'
import type { KitchenOffering } from '../models/offering.model'

/** Snapshot identity belongs to the child record, never a root configuration array. */
export function readKitchenOffering(
  id: string,
  value: unknown
): KitchenOffering | null {
  if (
    !isFirestoreDocumentId(id) ||
    id !== id.trim() ||
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  )
    return null
  const source = value as Record<string, unknown>
  if (
    Object.keys(source).some(
      (key) =>
        ![
          'id',
          'name',
          'enabled',
          'menu_ids',
          'hours',
          'collection_timing',
          'interactions',
        ].includes(key)
    ) ||
    (source.id !== undefined && source.id !== id) ||
    (source.collection_timing !== undefined &&
      !['same_day', 'next_day'].includes(String(source.collection_timing))) ||
    typeof source.name !== 'string' ||
    !source.name.trim() ||
    source.name.length > 120 ||
    typeof source.enabled !== 'boolean' ||
    !Array.isArray(source.menu_ids) ||
    source.menu_ids.length > 100 ||
    source.menu_ids.some(
      (menuId) => !isFirestoreDocumentId(menuId) || menuId !== menuId.trim()
    ) ||
    new Set(source.menu_ids).size !== source.menu_ids.length ||
    !Array.isArray(source.interactions) ||
    !source.interactions.length ||
    source.interactions.some(
      (item) =>
        !item ||
        typeof item !== 'object' ||
        Array.isArray(item) ||
        typeof item.enabled !== 'boolean'
    )
  )
    return null
  try {
    const interactions = source.interactions.map((value) => {
      const { type, ...changes } = value
      // Null is a command's removal instruction, never saved policy.
      if (changes.fulfilment?.deposit === null)
        throw new Error('Invalid saved deposit.')
      requireKitchenInteractionChanges(type, changes)
      return { type, ...changes }
    })
    const result = normalizeKitchenOfferings([{ ...source, id }])[0]
    if (
      !result ||
      result.interactions.length !== interactions.length ||
      (source.hours !== undefined && !result.hours)
    )
      return null
    if (source.hours !== undefined) {
      const hours = source.hours as Record<string, unknown>
      const normalized = result.hours!
      if (
        Object.keys(hours).some(
          (key) => !['source', 'timezone', 'windows'].includes(key)
        ) ||
        hours.source !== normalized.source ||
        hours.timezone !== normalized.timezone ||
        !Array.isArray(hours.windows) ||
        hours.windows.some((range, index) => {
          const expected = normalized.windows[index]!
          return (
            !range ||
            typeof range !== 'object' ||
            Array.isArray(range) ||
            Object.keys(range).some(
              (key) => !['days', 'open', 'close'].includes(key)
            ) ||
            !Array.isArray(range.days) ||
            range.days.length !== expected.days.length ||
            range.days.some(
              (day: unknown, i: number) => day !== expected.days[i]
            ) ||
            range.open !== expected.open ||
            range.close !== expected.close
          )
        })
      )
        return null
    }
    // Preserve valid settings exactly; UI normalization must not rewrite storage.
    return { ...result, interactions }
  } catch {
    return null
  }
}

export function readKitchenOfferingRecords(
  rows: Array<{ id: string; data: unknown }>
): KitchenOffering[] {
  const seen = new Set<string>()
  return [...rows]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((row) => {
      const value = readKitchenOffering(row.id, row.data)
      if (!value || seen.has(row.id))
        throw new Error('Kitchen offerings could not be read.')
      seen.add(row.id)
      return value
    })
}

export function kitchenOfferingData(offering: KitchenOffering) {
  const { id: _id, ...data } = offering
  return data
}
