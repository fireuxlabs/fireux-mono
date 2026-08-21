import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import {
  KitchenDefaults,
  type Kitchen,
  type KitchenStatus,
} from '../models/kitchen.model.ts'
import { readKitchenVisibility } from './kitchen-spine.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function normalizeKitchen(
  idValue: unknown,
  value: unknown,
  _ecosystem = ''
): Kitchen | null {
  const id = String(idValue ?? '').trim()
  const source = record(value)
  const slug = String(source.slug ?? '')
    .trim()
    .toLowerCase()
  if (!isFirestoreDocumentId(id) || !slug) return null

  const status = String(source.status ?? '').trim()
  if (!['active', 'inactive', 'archived'].includes(status)) return null

  return {
    ...KitchenDefaults,
    ...source,
    id,
    slug,
    status: status as KitchenStatus,
    visibility: readKitchenVisibility(source),
  } as Kitchen
}
