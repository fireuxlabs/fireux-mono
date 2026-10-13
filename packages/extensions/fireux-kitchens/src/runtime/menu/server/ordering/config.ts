import { kitchenMenuOrdering } from '../../utils/menu-ordering'
import type {
  MenuOrderFulfilmentPolicy,
  MenuOrderingConfig,
  MenuOrderTypeConfig,
} from '../../models/menu-ordering.model'
import type { KitchenFulfilment } from '../../../kitchen/models/fulfilment.model.ts'
import { kitchenPaymentMethodsForOrderType } from '../../../kitchen/utils/kitchen-readers.ts'
import { menuOrderTypeStrategy } from './order-type.ts'
import type { KitchenOrderIntake } from '../../../kitchen/models/order-intake.model'
import { kitchenOrderIntakePaused } from '../../../kitchen/utils/order-intake'

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
  kitchenFulfilment?: KitchenFulfilment,
  intake?: KitchenOrderIntake
): MenuOrderingConfig {
  const projection = kitchenMenuOrdering(kitchenOfferings, menuId)
  return {
    ...projection,
    order_types: projection.order_types.map((type) => {
      const configured = withKitchenFulfilment(type, kitchenFulfilment)
      return intake && kitchenOrderIntakePaused(intake, type.type)
        ? {
            ...configured,
            availability: {
              ...configured.availability,
              paused: true,
              message:
                intake.pause === 'all'
                  ? 'The Kitchen has paused all new orders.'
                  : 'The Kitchen has paused off-site orders.',
            },
          }
        : configured
    }),
  }
}

export function isMenuOrderingEnabled(ordering: MenuOrderingConfig) {
  return ordering.enabled && ordering.order_types.length > 0
}
