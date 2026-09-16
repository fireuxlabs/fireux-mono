import { kitchenMenuOrdering } from '../../utils/menu-ordering'
import type {
  MenuOrderFulfilmentPolicy,
  MenuOrderingConfig,
  MenuOrderTypeConfig,
} from '../../models/menu-ordering.model'
import type { KitchenFulfilment } from '../../../kitchen/models/fulfilment.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import { resolveKitchenServiceHours } from '../../../kitchen/utils/ordering-service-hours'
import { kitchenPaymentMethodsForOrderType } from '../../../kitchen/utils/kitchen-readers.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'

const mergeFulfilmentPolicy = (
  orderType: MenuOrderTypeConfig['type'],
  servicePolicy: MenuOrderFulfilmentPolicy | undefined,
  kitchenPolicy: KitchenFulfilment | undefined
): MenuOrderFulfilmentPolicy | undefined => {
  if (!servicePolicy && !kitchenPolicy) return undefined

  const deliveryZones = menuOrderTypeStrategy(orderType).resolvesDelivery
    ? kitchenPolicy?.delivery_zones || []
    : []
  // 2026-07-19 16:35 CEST — Payment capability and order-type applicability
  // are Kitchen truth. A Menu surface consumes the eligible projection only.
  const paymentMethods = kitchenPaymentMethodsForOrderType(
    kitchenPolicy,
    orderType
  )
  const deposit = servicePolicy?.deposit
  const handoffInstructions = servicePolicy?.handoff_instructions
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
  kitchenFulfilment?: KitchenFulfilment,
  kitchenOperationHours?: WeekdayTimeWindowsConfig
): MenuOrderTypeConfig => {
  const fulfilment = mergeFulfilmentPolicy(
    type.type,
    type.fulfilment,
    kitchenFulfilment
  )
  const serviceHours = resolveKitchenServiceHours(
    type.service_hours,
    kitchenOperationHours
  )

  return {
    ...type,
    ...(serviceHours ? { service_hours: serviceHours } : {}),
    ...(fulfilment ? { fulfilment } : {}),
  }
}

// Menu ordering spine: docs/concepts/family-menu.md. Menus are readable by default; order_types are the order creation policy.
export function readKitchenMenuOrdering(
  kitchenOrdering: unknown,
  menuId: string,
  kitchenFulfilment?: KitchenFulfilment,
  kitchenOperationHours?: WeekdayTimeWindowsConfig
): MenuOrderingConfig {
  const projection = kitchenMenuOrdering(kitchenOrdering, menuId)
  return {
    ...projection,
    order_types: projection.order_types.map((type) =>
      withKitchenFulfilment(type, kitchenFulfilment, kitchenOperationHours)
    ),
  }
}

export function isMenuOrderingEnabled(ordering: MenuOrderingConfig) {
  return ordering.enabled && ordering.order_types.length > 0
}
