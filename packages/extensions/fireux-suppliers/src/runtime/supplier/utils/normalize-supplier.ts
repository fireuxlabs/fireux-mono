import { readFireuxEntityManagement } from 'fireux-core/runtime/app/utils/entity-management'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import type { Supplier } from '../models/Supplier.model'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
const onlyKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).every((key) => keys.includes(key))
const stamp = (value: unknown, keys: string[]) => {
  const source = record(value)
  return Boolean(
    source &&
      onlyKeys(source, keys) &&
      record(source.at) &&
      ['by', 'app_id'].every(
        (key) => source[key] === undefined || typeof source[key] === 'string'
      )
  )
}

export function normalizeSupplier(
  idValue: unknown,
  value: unknown
): Supplier | null {
  if (typeof idValue !== 'string' || !isFirestoreDocumentId(idValue))
    return null
  const id = idValue.trim()
  const source = record(value)
  if (
    !source ||
    !onlyKeys(source, [
      'context',
      'id',
      'company_id',
      'management',
      'identity',
      'catalogue',
      'delivery',
      'created',
      'updated',
    ]) ||
    (source.id !== undefined && source.id !== id)
  )
    return null
  if (source.context !== undefined && (typeof source.context !== 'string' || source.context.length > 32000)) return null
  const management = readFireuxEntityManagement(source.management)
  const identity = record(source.identity)
  const catalogue = record(source.catalogue)
  const delivery = record(source.delivery)
  if (
    !management ||
    typeof source.company_id !== 'string' ||
    !isFirestoreDocumentId(source.company_id) ||
    !identity ||
    !onlyKeys(identity, ['slug', 'status', 'visibility']) ||
    typeof identity.slug !== 'string' ||
    !identity.slug.trim() ||
    identity.slug.length > 200 ||
    typeof identity.status !== 'string' ||
    !['active', 'inactive', 'archived'].includes(identity.status) ||
    typeof identity.visibility !== 'boolean' ||
    !catalogue ||
    !onlyKeys(catalogue, ['mode']) ||
    typeof catalogue.mode !== 'string' ||
    !['integrated', 'directory_only'].includes(catalogue.mode) ||
    !delivery ||
    !onlyKeys(delivery, ['areas']) ||
    !Array.isArray(delivery.areas) ||
    delivery.areas.length > 100 ||
    delivery.areas.some(
      (area) => typeof area !== 'string' || !area.trim() || area.length > 160
    ) ||
    !stamp(source.created, ['at', 'by', 'app_id']) ||
    !stamp(source.updated, ['at', 'by'])
  )
    return null
  return {
    ...(typeof source.context === 'string' ? { context: source.context } : {}),
    id,
    management,
    company_id: source.company_id.trim(),
    identity: {
      slug: identity.slug.trim(),
      status: identity.status as Supplier['identity']['status'],
      visibility: identity.visibility,
    },
    catalogue: { mode: catalogue.mode as Supplier['catalogue']['mode'] },
    delivery: { areas: delivery.areas.map((area) => (area as string).trim()) },
    created: source.created as Supplier['created'],
    updated: source.updated as Supplier['updated'],
  }
}
