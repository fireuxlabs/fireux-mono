import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import type { Kitchen } from '../models/kitchen.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { readKitchenCurrency, readKitchenVisibility } from './kitchen-readers.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function readKitchenIdentitySource(
  value: unknown
): Kitchen['identity_source'] {
  return value === 'user' ? 'user' : 'place'
}

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
    currency: readKitchenCurrency(source),
    identity_source: readKitchenIdentitySource(source.identity_source),
    slug,
    status: status as Kitchen['status'],
    visibility: readKitchenVisibility(source),
    place,
  }
}
