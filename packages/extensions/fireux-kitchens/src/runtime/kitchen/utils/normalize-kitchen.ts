import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import type {
  Kitchen,
  KitchenFulfilmentMode,
} from '../models/kitchen.model.ts'
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
): Kitchen | null {
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
  const fulfilment = record(source.fulfilment)
  const modes = Array.isArray(fulfilment.modes)
    ? fulfilment.modes.filter(
        (mode): mode is KitchenFulfilmentMode =>
          mode === 'delivery' ||
          mode === 'collection' ||
          mode === 'dine_in' ||
          mode === 'takeaway'
      )
    : []
  const estimate = record(fulfilment.estimated_minutes)
  const min = Number(estimate.min)
  const max = Number(estimate.max)
  const hasEstimate =
    Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max >= min

  return {
    id,
    slug,
    status: status as Kitchen['status'],
    visibility: readKitchenVisibility(source),
    place,
    fulfilment: {
      modes,
      ...(hasEstimate
        ? { estimated_minutes: { min, max } }
        : {}),
    },
  }
}
