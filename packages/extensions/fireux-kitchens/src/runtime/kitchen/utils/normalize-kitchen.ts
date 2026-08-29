import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import type { Kitchen } from '../models/kitchen.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { readKitchenVisibility } from './kitchen-readers.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function normalizeKitchen(
  idValue: unknown,
  value: unknown,
  place: Place | null
): (Kitchen & { place: Place }) | null {
  const id = String(idValue ?? '').trim()
  const source = record(value)
  const slug = String(source.slug ?? '')
    .trim()
    .toLowerCase()
  if (!isFirestoreDocumentId(id) || !slug || !place || place.id !== id) {
    return null
  }

  const status = String(source.status ?? '').trim()
  if (!['active', 'inactive', 'archived'].includes(status)) return null
  return {
    id,
    slug,
    status: status as Kitchen['status'],
    visibility: readKitchenVisibility(source),
    place,
  }
}
