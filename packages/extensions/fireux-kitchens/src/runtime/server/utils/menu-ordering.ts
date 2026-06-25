import type {
  MenuOrderingConfig,
  MenuOrderTypeConfig,
} from '../../models/menu/menu.model.ts'
import { menuSurfaceList, menuSurfaceText } from './menu-surface-types.ts'
import { readMenuOrderTypeConfig } from '../../utils/menu-ordering-policy.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const unique = <T extends string>(values: T[]) =>
  values.filter((value, index, source) => source.indexOf(value) === index)

const orderingType = (value: unknown): MenuOrderTypeConfig | null => {
  const row = record(value)
  const normalized = readMenuOrderTypeConfig(row)

  if (!normalized) return null

  return {
    ...normalized,
    ...(menuSurfaceText(row.message) ? { message: menuSurfaceText(row.message) } : {}),
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
