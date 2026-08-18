// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: resolve Delivery zones and payments strictly from Kitchen capability.
import type {
  MenuOrderFulfilmentPolicy,
  MenuOrderingConfig,
  MenuOrderTypeConfig,
} from '../../../models/kitchen/menu/menu.model.ts'
import type { KitchenFulfilmentConfig } from '../../../models/kitchen.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import {
  readMenuOrderTypeConfig,
  readMenuServiceHoursConfig,
} from '../../../utils/menu-ordering-policy.ts'
import {
  resolveMenuServiceHours,
  resolveMenuSurfaceServiceHours,
} from '../../../utils/menu-service-hours.ts'
import { kitchenPaymentMethodsForOrderType } from '../../../utils/kitchen-spine.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'

const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown) => (Array.isArray(value) ? value : [])
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
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
  kitchenPolicy: KitchenFulfilmentConfig | undefined
): MenuOrderFulfilmentPolicy | undefined => {
  if (!menuPolicy && !kitchenPolicy) return undefined

  const deliveryZones = menuOrderTypeStrategy(orderType).resolvesDelivery
    ? kitchenPolicy?.delivery_zones || []
    : []
  // 2026-07-19 16:35 CEST — Payment capability and order-type applicability
  // are Kitchen truth. A Menu surface consumes the eligible projection only.
  const paymentMethods = kitchenPaymentMethodsForOrderType(
    kitchenPolicy,
    orderType
  )
  const deposit = menuPolicy?.deposit
  const handoffInstructions = menuPolicy?.handoff_instructions
  const next: MenuOrderFulfilmentPolicy = {
    ...(deliveryZones.length ? { delivery_zones: deliveryZones } : {}),
    ...(paymentMethods.length ? { payment_methods: paymentMethods } : {}),
    ...(deposit ? { deposit } : {}),
    ...(handoffInstructions
      ? { handoff_instructions: handoffInstructions }
      : {}),
  }

  return Object.keys(next).length ? next : undefined
}

const withKitchenFulfilment = (
  type: MenuOrderTypeConfig,
  kitchenFulfilment?: KitchenFulfilmentConfig,
  menuOperationHours?: WeekdayTimeWindowsConfig,
  kitchenOperationHours?: WeekdayTimeWindowsConfig
): MenuOrderTypeConfig => {
  const fulfilment = mergeFulfilmentPolicy(
    type.type,
    type.fulfilment,
    kitchenFulfilment
  )
  const serviceHours = resolveMenuSurfaceServiceHours(
    type.service_hours,
    menuOperationHours,
    kitchenOperationHours
  )

  return {
    ...type,
    ...(serviceHours ? { service_hours: serviceHours } : {}),
    ...(fulfilment ? { fulfilment } : {}),
  }
}

// Menu ordering spine: docs/concepts/family-menu.md. Menus are readable by default; order_types are the order creation policy.
export function readMenuOrderingConfig(
  data: Record<string, unknown>,
  kitchenFulfilment?: KitchenFulfilmentConfig,
  kitchenOperationHours?: WeekdayTimeWindowsConfig
): MenuOrderingConfig {
  const ordering = record(data.ordering)
  const orderTypes = list(ordering.order_types)
    .map(orderingType)
    .filter((type): type is MenuOrderTypeConfig => Boolean(type))
  const serviceHours = resolveMenuServiceHours(
    readMenuServiceHoursConfig(ordering.service_hours),
    kitchenOperationHours
  )

  if (orderTypes.length) {
    return {
      enabled: ordering.enabled === true,
      order_types: orderTypes.map((type) =>
        withKitchenFulfilment(
          type,
          kitchenFulfilment,
          serviceHours?.operation_hours,
          kitchenOperationHours
        )
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
  return unique(
    readMenuOrderingConfig(data).order_types.map((type) => type.type)
  )
}
