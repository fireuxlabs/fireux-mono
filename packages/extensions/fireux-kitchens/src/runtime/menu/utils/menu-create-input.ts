import type { KitchenMenu as Menu } from './kitchen-menu'
import { compactMenuServiceHoursDelta } from './menu-service-hours'
export type MenuCreateInput = {
  kitchenId?: string
  name: string
  description?: string
  status?: Menu['status']
  doc?: Menu['doc']
  ordering?: Menu['ordering']
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const compactValue = (value: unknown): unknown => {
  if (typeof value === 'string') return normalizeString(value) || undefined
  if (Array.isArray(value)) {
    const items = value.map(compactValue).filter((item) => item !== undefined)
    return items.length ? items : undefined
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compactValue(item)] as const)
      .filter(([, item]) => item !== undefined)
    return entries.length ? Object.fromEntries(entries) : undefined
  }
  return value === null || value === undefined ? undefined : value
}

export function buildMenuPayload(
  input: MenuCreateInput,
  name: string
): Partial<Menu> {
  const orderTypes = Array.isArray(input.ordering?.order_types)
    ? input.ordering.order_types
        .map(compactValue)
        .filter(
          (row): row is Record<string, unknown> =>
            isRecord(row) && Boolean(normalizeString(row.type))
        )
    : []
  const serviceHours = compactMenuServiceHoursDelta(
    input.ordering?.service_hours
  )
  const payload: Partial<Menu> = {
    name,
    status: input.status || 'draft',
    sort_order: 0,
    ordering: { enabled: false, order_types: [] },
  }
  const put = (key: keyof Menu, value: unknown) => {
    const next = normalizeString(value)
    if (next) (payload as Record<string, unknown>)[key] = next
  }

  put('description', input.description)
  if (input.doc) {
    const doc = Object.fromEntries(
      ['url', 'name', 'type', 'storage_path'].map((key) => [
        key, normalizeString(input.doc?.[key as keyof NonNullable<Menu['doc']>]),
      ])
    ) as NonNullable<Menu['doc']>
    if (Object.values(doc).some(Boolean)) {
      if (!Object.values(doc).every(Boolean)) throw new Error('Menu document metadata is incomplete.')
      payload.doc = doc
    }
  }
  if (input.ordering?.enabled === true && orderTypes.length) {
    payload.ordering = {
      enabled: true,
      order_types: orderTypes as Menu['ordering']['order_types'],
      ...(serviceHours ? { service_hours: serviceHours } : {}),
    }
  } else if (serviceHours) {
    payload.ordering = {
      enabled: false,
      order_types: [],
      service_hours: serviceHours,
    }
  }

  return payload
}
