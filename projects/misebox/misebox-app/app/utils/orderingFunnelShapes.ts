import type {
  MenuOrderingBasket,
  MenuOrderingDraft,
  MenuOrderingDraftContext,
  MenuOrderingKitchenIntake,
  MenuOrderingOperatorPresence,
  MenuOrderingRouteContext,
  MenuOrderingSubmission,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'
import type {
  KitchenOrder,
  KitchenOrderCustomer,
  KitchenOrderItem,
  KitchenOrderPayment,
  KitchenOrderType,
} from 'fireux-kitchens/runtime/models/kitchen/order.model'

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
  status: string
  [key: string]: unknown
}

export type OrderingFunnelShapeOptions = {
  basket?: MenuOrderingBasket
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
  const kitchen = createKitchenReceiving(withSubmission, options.payment)

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
  const order = {
    id: intake.submission.id,
    kitchen_id: intake.submission.kitchen_id,
    menu_id: intake.submission.menu_id,
    order_number: intake.submission.order_number,
    status: 'pending_acceptance',
    order_type: intake.orderType,
    ...(requestedFor ? { requested_for: requestedFor } : {}),
    ...(intake.collection ? { collection: intake.collection } : {}),
    estimated_ready_minutes: 0,
    estimated_ready_at: '',
    fire_state: 'held',
    items,
    fulfilment_policy: {},
    fulfilment_match: fulfilment,
    driver_responses: {},
    ...(Object.keys(customer).length ? { customer } : {}),
    payment,
    channel: 'menu',
    app_id: 'misebox-app',
    creator_id: 'menu',
    created_at: '',
    updated_at: '',
    created: {
      at: '',
      by: 'menu',
      app_id: 'misebox-app',
    },
    updated: {
      at: '',
      by: 'menu',
    },
  } as unknown as KitchenOrder

  return {
    order,
    shape: {
      ...intake,
      given: {
        status: 'pending_acceptance',
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

function kitchenFulfilment(intake: MenuOrderingKitchenIntake) {
  if (intake.delivery) {
    return {
      type: 'delivery',
      zone: intake.delivery.zone || {},
    }
  }
  if (intake.table) {
    return {
      type: 'table',
      table_number: intake.table.number,
    }
  }
  if (intake.kiosk) {
    return {
      type: 'kiosk',
      mode: intake.kiosk.mode,
      handoff: intake.kiosk.handoff,
      ...(intake.kiosk.queueArea ? { queue_area: intake.kiosk.queueArea } : {}),
    }
  }
  if (intake.roomService) {
    return {
      type: 'room_service',
      room: intake.roomService.room,
    }
  }
  if (intake.preOrder) {
    return {
      type: 'pre_order',
      requested_for: intake.preOrder.requested_for,
      notice_hours: intake.preOrder.notice_hours,
    }
  }
  if (intake.catering) {
    return {
      type: 'catering',
      event_date: intake.catering.eventDate,
      location: intake.catering.location,
      party_size: intake.catering.partySize,
    }
  }

  return {}
}
