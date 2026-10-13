import { kitchenMenuOrdering } from '../../utils/menu-ordering'
import type {
  MenuOrderFulfilmentPolicy,
  MenuOrderingConfig,
  MenuOrderTypeConfig,
} from '../../models/menu-ordering.model'
import type { KitchenFulfilment } from '../../../kitchen/models/fulfilment.model.ts'
import { kitchenPaymentMethodsForOrderType } from '../../../kitchen/utils/kitchen-readers.ts'
import { menuOrderTypeStrategy } from './service-strategy.ts'

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
  kitchenFulfilment?: KitchenFulfilment
): MenuOrderTypeConfig => {
  const fulfilment = mergeFulfilmentPolicy(
    type.type,
    type.fulfilment,
    kitchenFulfilment
  )

  return {
    ...type,
    ...(fulfilment ? { fulfilment } : {}),
  }
}

// Menu ordering spine: docs/concepts/family-menu.md. Menus are readable by default; order_types are the order creation policy.
export function readKitchenMenuOrdering(
  kitchenOfferings: unknown,
  menuId: string,
  kitchenFulfilment?: KitchenFulfilment
): MenuOrderingConfig {
  const projection = kitchenMenuOrdering(kitchenOfferings, menuId)
  return {
    ...projection,
    enabled: false,
    order_types: projection.order_types.map((type) =>
      withKitchenFulfilment(type, kitchenFulfilment)
    ),
  }
}

export function isMenuOrderingEnabled(ordering: MenuOrderingConfig) {
  return false
}
