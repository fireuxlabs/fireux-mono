import { readFireuxEntityManagement } from 'fireux-core/runtime/utils/entity-management'
import type { Supplier } from '../models/Supplier.model'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
const text = (value: unknown) => String(value ?? '').trim()
const strings = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

export function normalizeSupplier(idValue: unknown, value: unknown): Supplier | null {
  const id = text(idValue)
  const source = record(value)
  const management = readFireuxEntityManagement(source?.management)
  const companyId = text(source?.company_id)
  const slug = text(source?.slug)
  const status = text(source?.status)
  const catalogueState = text(source?.catalogue_state)
  const created = record(source?.created)
  const updated = record(source?.updated)
  if (
    !id || !source || !management || !companyId || !slug ||
    !['active', 'inactive', 'archived'].includes(status) ||
    typeof source.visibility !== 'boolean' ||
    !['integrated', 'directory_only'].includes(catalogueState) ||
    !created?.at || !updated?.at
  ) return null

  return {
    id,
    management,
    company_id: companyId,
    slug,
    status: status as Supplier['status'],
    visibility: source.visibility,
    catalogue_state: catalogueState as Supplier['catalogue_state'],
    delivery_areas: strings(source.delivery_areas),
    created: source.created as Supplier['created'],
    updated: source.updated as Supplier['updated'],
  }
}
