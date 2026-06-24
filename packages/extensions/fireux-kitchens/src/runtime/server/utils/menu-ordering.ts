import type {
  MenuOrderingConfig,
  MenuOrderingModeConfig,
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

const orderingMode = (value: unknown): MenuOrderingModeConfig | null => {
  const mode = record(value)
  const type = orderType(mode.type)
  const serviceMode = orderType(mode.service_mode)
  const notice = noticeHours(mode.notice_hours)

  if (!type) return null

  return {
    type,
    ...(serviceMode ? { service_mode: serviceMode } : {}),
    ...(notice ? { notice_hours: notice } : {}),
  }
}

const legacyOrderTypes = (value: unknown) =>
  unique(
    menuSurfaceList(value)
      .map(orderType)
      .filter((type): type is KitchenOrderType => Boolean(type))
  )

// Menu ordering spine: docs/concepts/family-menu.md. Public views are display; this object is the order creation policy.
export function readMenuOrderingConfig(
  data: Record<string, unknown>
): MenuOrderingConfig {
  const ordering = record(data.ordering)
  const modes = menuSurfaceList(ordering.modes)
    .map(orderingMode)
    .filter((mode): mode is MenuOrderingModeConfig => Boolean(mode))

  if (modes.length) {
    return {
      enabled: ordering.enabled === true,
      modes,
    }
  }

  const legacyOrderingModes = legacyOrderTypes(data.ordering_modes)
  const legacyServiceModes = legacyOrderTypes(data.service_modes)
  const legacyModes = legacyOrderingModes.length
    ? legacyOrderingModes
    : data.ordering_enabled === true
      ? legacyServiceModes
      : []

  return {
    enabled: data.ordering_enabled === true && legacyModes.length > 0,
    modes: legacyModes.map((type) => ({ type })),
  }
}

export function isMenuOrderingEnabled(ordering: MenuOrderingConfig) {
  return ordering.enabled && ordering.modes.length > 0
}

export function readMenuOrderingModes(data: Record<string, unknown>) {
  return unique(readMenuOrderingConfig(data).modes.map((mode) => mode.type))
}
