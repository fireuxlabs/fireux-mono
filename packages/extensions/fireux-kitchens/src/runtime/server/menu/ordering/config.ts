import type {
  MenuOrderFulfilmentPolicy,
  MenuOrderingConfig,
  MenuOrderTypeConfig,
  MenuServiceHoursConfig,
} from '../../../models/kitchen/menu/menu.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import {
  readMenuOrderTypeConfig,
  readMenuServiceHoursConfig,
} from '../../../utils/menu-ordering-policy.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'

const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown) => Array.isArray(value) ? value : []
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
    ...(text(row.message) ? { message: text(row.message) } : {}),
  }
}

const mergeFulfilmentPolicy = (
  orderType: MenuOrderTypeConfig['type'],
  menuPolicy: MenuOrderFulfilmentPolicy | undefined,
  kitchenPolicy: MenuOrderFulfilmentPolicy | undefined
): MenuOrderFulfilmentPolicy | undefined => {
  if (!menuPolicy && !kitchenPolicy) return undefined

  const deliveryZones = menuOrderTypeStrategy(orderType).resolvesDelivery
    ? menuPolicy?.delivery_zones?.length
      ? menuPolicy.delivery_zones
      : kitchenPolicy?.delivery_zones || []
    : []
  const paymentMethods = menuPolicy?.payment_methods?.length
    ? menuPolicy.payment_methods
    : kitchenPolicy?.payment_methods || []
  const deposit = menuPolicy?.deposit || kitchenPolicy?.deposit
  const next: MenuOrderFulfilmentPolicy = {
    ...(deliveryZones.length ? { delivery_zones: deliveryZones } : {}),
    ...(paymentMethods.length ? { payment_methods: paymentMethods } : {}),
    ...(deposit ? { deposit } : {}),
  }

  return Object.keys(next).length ? next : undefined
}

const withKitchenFulfilment = (
  type: MenuOrderTypeConfig,
  kitchenFulfilment?: MenuOrderFulfilmentPolicy,
  kitchenOperationHours?: WeekdayTimeWindowsConfig
): MenuOrderTypeConfig => {
  const fulfilment = mergeFulfilmentPolicy(
    type.type,
    type.fulfilment,
    kitchenFulfilment
  )

  return {
    ...type,
    ...(withInheritedOperationHours(type.service_hours, kitchenOperationHours)
      ? {
          service_hours: withInheritedOperationHours(
            type.service_hours,
            kitchenOperationHours
          ),
        }
      : {}),
    ...(fulfilment ? { fulfilment } : {}),
  }
}

const withInheritedOperationHours = (
  serviceHours: MenuServiceHoursConfig | undefined,
  kitchenOperationHours: WeekdayTimeWindowsConfig | undefined
) => {
  if (!serviceHours) return undefined
  if (!serviceHours.inherit_kitchen_operation_hours) return serviceHours
  if (serviceHours.operation_hours?.windows.length) return serviceHours
  if (!kitchenOperationHours?.windows.length) return serviceHours

  return {
    ...serviceHours,
    operation_hours: kitchenOperationHours,
  }
}

// Menu ordering spine: docs/concepts/family-menu.md. Menus are readable by default; order_types are the order creation policy.
export function readMenuOrderingConfig(
  data: Record<string, unknown>,
  kitchenFulfilment?: MenuOrderFulfilmentPolicy,
  kitchenOperationHours?: WeekdayTimeWindowsConfig
): MenuOrderingConfig {
  const ordering = record(data.ordering)
  const orderTypes = list(ordering.order_types)
    .map(orderingType)
    .filter((type): type is MenuOrderTypeConfig => Boolean(type))
  const serviceHours = withInheritedOperationHours(
    readMenuServiceHoursConfig(ordering.service_hours),
    kitchenOperationHours
  )

  if (orderTypes.length) {
    return {
      enabled: ordering.enabled === true,
      order_types: orderTypes.map((type) =>
        withKitchenFulfilment(type, kitchenFulfilment, kitchenOperationHours)
      ),
      ...(serviceHours ? { service_hours: serviceHours } : {}),
    }
  }

  return {
    enabled: false,
    order_types: [],
    ...(serviceHours ? { service_hours: serviceHours } : {}),
  }
}

export function isMenuOrderingEnabled(ordering: MenuOrderingConfig) {
  return ordering.enabled && ordering.order_types.length > 0
}

export function readMenuOrderTypes(data: Record<string, unknown>) {
  return unique(readMenuOrderingConfig(data).order_types.map((type) => type.type))
}
