import type {
  MenuOrderingBasket,
  MenuOrderingDraft,
  MenuOrderingDraftContext,
  MenuOrderingKitchenIntake,
  MenuOrderingOperatorPresence,
  MenuOrderingRouteContext,
  MenuOrderingSubmission,
} from 'fireux-kitchens/runtime/menu/models/menu-ordering.model'
import type {
  KitchenOrder,
  KitchenOrderChannel,
  KitchenOrderCustomer,
  KitchenOrderFulfilmentMatch,
  KitchenOrderItem,
  KitchenOrderPayment,
  KitchenOrderStatus,
  KitchenOrderType,
} from 'fireux-kitchens/runtime/kitchen/utils/order'
import {
  KitchenOrderDefaults,
  resolveKitchenOrderIntakeStatus,
} from 'fireux-kitchens/runtime/kitchen/utils/order'

type DraftModePatch = Partial<
  Pick<
    MenuOrderingDraft,
    | 'catering'
    | 'collection'
    | 'delivery'
    | 'kiosk'
    | 'preOrder'
    | 'roomService'
    | 'table'
  >
>

export type OrderingFunnelShapeTrack = {
  basket: MenuOrderingBasket
  kitchen: OrderingKitchenReceiving
  modeLabel: string
  orderType: KitchenOrderType
  start: MenuOrderingDraftContext
  withAllergen: MenuOrderingDraft
  withMode: MenuOrderingDraft
  withSubmission: MenuOrderingKitchenIntake
}

export type OrderingKitchenReceiving = {
  order: KitchenOrder
  shape: MenuOrderingKitchenIntake & {
    given: OrderingKitchenReceivingGiven
  }
}

export type OrderingKitchenReceivingGiven = {
  status: KitchenOrderStatus
  [key: string]: unknown
}

export type OrderingFunnelShapeOptions = {
  basket?: MenuOrderingBasket
  channel: KitchenOrderChannel
  mode: DraftModePatch
  modeLabel: string
  orderType: KitchenOrderType
  operator?: MenuOrderingOperatorPresence
  payment?: KitchenOrderPayment
  route: MenuOrderingRouteContext
  submission: MenuOrderingSubmission
}

const emptyBasket = (): MenuOrderingBasket => ({
  items: [],
  quantity: 0,
})

const sampleBasket = (): MenuOrderingBasket => ({
  items: [
    {
      id: 'pizza-margherita',
      lineId: 'pizza-margherita',
      name: 'Pizza Margherita',
      quantity: 1,
      unitPrice: 17,
    },
    {
      id: 'knoblauchbrot',
      lineId: 'knoblauchbrot',
      name: 'Knoblauchbrot',
      quantity: 2,
      unitPrice: 6.5,
    },
  ],
  quantity: 3,
})

export function createOrderingFunnelShapeTrack(
  options: OrderingFunnelShapeOptions
): OrderingFunnelShapeTrack {
  const basket = options.basket || sampleBasket()
  const basketDraft: MenuOrderingDraft = {
    orderType: options.orderType,
    basket,
  }
  const withAllergen: MenuOrderingDraft = {
    ...basketDraft,
    allergen: {
      checked: true,
    },
  }
  const withMode: MenuOrderingDraft = {
    ...withAllergen,
    ...options.mode,
  }
  const withSubmission: MenuOrderingKitchenIntake = {
    ...withMode,
    ...(options.operator ? { operator: options.operator } : {}),
    submission: options.submission,
  }
  const kitchen = createKitchenReceiving(
    withSubmission,
    options.channel,
    options.payment
  )

  return {
    basket,
    kitchen,
    modeLabel: options.modeLabel,
    orderType: options.orderType,
    start: {
      route: options.route,
      draft: {
        orderType: options.orderType,
        basket: emptyBasket(),
      },
    },
    withAllergen,
    withMode,
    withSubmission,
  }
}

function createKitchenReceiving(
  intake: MenuOrderingKitchenIntake,
  channel: KitchenOrderChannel,
  paymentOverride?: KitchenOrderPayment
): OrderingKitchenReceiving {
  const customer = kitchenCustomer(intake)
  const fulfilment = kitchenFulfilment(intake)
  const requestedFor = intake.preOrder?.requested_for
  const payment: KitchenOrderPayment = paymentOverride || {
    required: false,
    status: 'not_required',
    currency_code: 'CHF',
  }
  const items = kitchenItems(intake.basket)
  const status = resolveKitchenOrderIntakeStatus({
    orderType: intake.orderType,
    paymentPending: payment.required && payment.status !== 'paid',
  })
  const order: KitchenOrder = {
    ...KitchenOrderDefaults,
    id: intake.submission.id,
    kitchen_id: intake.submission.kitchen_id,
    menu_id: intake.submission.menu_id,
    order_number: intake.submission.order_number,
    status,
    order_type: intake.orderType,
    ...(requestedFor ? { requested_for: requestedFor } : {}),
    ...(intake.collection ? { collection: intake.collection } : {}),
    ...(intake.table ? { table: intake.table } : {}),
    ...(intake.roomService ? { room_service: intake.roomService } : {}),
    items,
    ...(fulfilment ? { fulfilment_match: fulfilment } : {}),
    ...(Object.keys(customer).length ? { customer } : {}),
    payment,
    channel,
  }

  return {
    order,
    shape: {
      ...intake,
      given: {
        status,
        ...(intake.operator ? { operator: intake.operator } : {}),
      },
    },
  }
}

function kitchenItems(basket: MenuOrderingBasket): KitchenOrderItem[] {
  return basket.items.map((item, index) => ({
    id: `item-${index + 1}`,
    dish_id: item.id,
    label: item.name,
    quantity: item.quantity,
    ...(item.unitPrice ? { unit_price: item.unitPrice } : {}),
    checked: false,
  }))
}

function kitchenCustomer(
  intake: MenuOrderingKitchenIntake
): KitchenOrderCustomer {
  return {
    ...(intake.delivery?.address?.input
      ? { address: intake.delivery.address.input }
      : {}),
    ...(intake.delivery?.address?.place_id
      ? { address_place_id: intake.delivery.address.place_id }
      : {}),
    ...(intake.preOrder?.party_size
      ? { party_size: intake.preOrder.party_size }
      : {}),
    ...(intake.catering?.partySize
      ? { party_size: intake.catering.partySize }
      : {}),
  }
}

function kitchenFulfilment(
  intake: MenuOrderingKitchenIntake
): KitchenOrderFulfilmentMatch | undefined {
  if (intake.delivery) {
    return {
      type: 'delivery_zone',
      zone: intake.delivery.zone || {},
    }
  }
  if (intake.table) {
    return {
      type: 'table',
      reference: intake.table.number,
      handoff: 'table_service',
    }
  }
  if (intake.kiosk) {
    return {
      type: 'counter',
      reference: intake.kiosk.queueArea || intake.submission.order_number,
      handoff: intake.kiosk.handoff,
    }
  }
  if (intake.roomService) {
    return {
      type: 'room_service',
      reference: intake.roomService.room,
    }
  }

  return undefined
}
