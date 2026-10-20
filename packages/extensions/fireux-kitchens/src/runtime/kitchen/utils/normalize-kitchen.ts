import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import type { Kitchen } from '../models/kitchen.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { readKitchenVisibility } from './kitchen-readers.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function readKitchenIdentitySource(
  value: unknown
): Kitchen['identity']['source'] {
  return value === 'user' || value === 'place' ? value : undefined
}

export function normalizeKitchen(
  idValue: unknown,
  value: unknown,
  place: Place | null
): (Kitchen & { place: Place }) | null {
  const id = String(idValue ?? '').trim()
  const source = record(value)
  const identity = record(source.identity)
  const slug = String(identity.slug ?? '')
    .trim()
    .toLowerCase()
  if (!isFirestoreDocumentId(id) || !slug || !place || place.id !== id) {
    return null
  }

  const status = String(identity.status ?? '').trim()
  if (!['active', 'inactive', 'archived'].includes(status)) return null
  return {
    id,
    identity: {
      ...(readKitchenIdentitySource(identity.source)
        ? { source: readKitchenIdentitySource(identity.source) }
        : {}),
      slug,
      status: status as Kitchen['identity']['status'],
      visibility: readKitchenVisibility(source),
    },
    services: { title: String(record(source.services).title || '').trim() || 'Food & drinks' },
    place,
  }
}
