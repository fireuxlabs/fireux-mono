import type {
  MenuOrderingConfig,
  MenuOrderTypeConfig,
} from '../../models/menu/menu.model.ts'
import type { KitchenOrderType } from '../../models/order.model.ts'
import { menuSurfaceList, menuSurfaceText } from './menu-surface-types.ts'

const orderTypes = [
  'dine_in',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const satisfies readonly KitchenOrderType[]

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const unique = <T extends string>(values: T[]) =>
  values.filter((value, index, source) => source.indexOf(value) === index)

const orderType = (value: unknown): KitchenOrderType | null => {
  const type = menuSurfaceText(value) as KitchenOrderType

  return orderTypes.includes(type) ? type : null
}

const noticeHours = (value: unknown) => {
  const hours = Number(value)

  return Number.isFinite(hours) && hours > 0 ? hours : undefined
}

const orderingType = (value: unknown): MenuOrderTypeConfig | null => {
  const row = record(value)
  const type = orderType(row.type)
  const notice = noticeHours(row.notice_hours)
  const message = menuSurfaceText(row.message)

  if (!type) return null

  return {
    type,
    ...(notice ? { notice_hours: notice } : {}),
    ...(message ? { message } : {}),
  }
}

// Menu ordering spine: docs/concepts/family-menu.md. Public views are display; order_types are the order creation policy.
export function readMenuOrderingConfig(
  data: Record<string, unknown>
): MenuOrderingConfig {
  const ordering = record(data.ordering)
  const orderTypes = menuSurfaceList(ordering.order_types)
    .map(orderingType)
    .filter((type): type is MenuOrderTypeConfig => Boolean(type))

  if (orderTypes.length) {
    return {
      enabled: ordering.enabled === true,
      order_types: orderTypes,
    }
  }

  return {
    enabled: false,
    order_types: [],
  }
}

export function isMenuOrderingEnabled(ordering: MenuOrderingConfig) {
  return ordering.enabled && ordering.order_types.length > 0
}

export function readMenuOrderTypes(data: Record<string, unknown>) {
  return unique(readMenuOrderingConfig(data).order_types.map((type) => type.type))
}
