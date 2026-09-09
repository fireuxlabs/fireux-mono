import type { KitchenMenu as Menu } from './kitchen-menu'
import { compactMenuServiceHoursDelta } from './menu-service-hours'
export type MenuCreateInput = {
  kitchenId?: string
  id?: string
  name: string
  description?: string
  status?: Menu['status']
  doc_url?: string
  doc_name?: string
  doc_type?: string
  doc_storage_path?: string
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
  const kitchenId = normalizeString(input.kitchenId)
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
    kitchen_id: kitchenId,
    name,
    status: input.status || 'draft',
  }
  const put = (key: keyof Menu, value: unknown) => {
    const next = normalizeString(value)
    if (next) (payload as Record<string, unknown>)[key] = next
  }

  put('description', input.description)
  put('doc_url', input.doc_url)
  put('doc_name', input.doc_name)
  put('doc_type', input.doc_type)
  put('doc_storage_path', input.doc_storage_path)
  if (input.ordering?.enabled === true && orderTypes.length) {
    payload.ordering = {
      enabled: true,
      order_types: orderTypes as Menu['ordering']['order_types'],
      ...(serviceHours ? { service_hours: serviceHours } : {}),
    }
  } else if (serviceHours) {
    payload.ordering = {
      enabled: false,
      service_hours: serviceHours,
    } as Menu['ordering']
  }

  return payload
}
