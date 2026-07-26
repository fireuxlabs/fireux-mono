// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: model a coherent fictional service with valid Order lifecycle, pricing and food references.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: retain Deanos operations and keep Garden Room intentionally service-empty.
// Concurrent edit — 2026-07-22 14:12 CEST — Demo lifecycle correction: retain acceptance estimates through accepted and ready service states.
// Concurrent edit — 2026-07-22 14:31 CEST — Demo policy correction: keep collection customer data aligned with its required-field snapshot.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: distinguish Deanos Smash Burger service from Misebox Restaurant.
// Concurrent edit — 2026-07-22 18:12 CEST — Demo integrity pass: align Deanos service items and retain Pizza the Action as presentation-only.
import type { DishItemKind } from '../../models/kitchen/dish.model'
import {
  KitchenMiseTaskModel,
  type KitchenMiseTask,
} from '../../models/kitchen/mise.model'
import {
  KitchenOrderModel,
  type KitchenOrder,
  type KitchenOrderChannel,
  type KitchenOrderItem,
  type KitchenOrderPayment,
  type KitchenOrderPaymentMethod,
  type KitchenOrderStatus,
  type KitchenOrderType,
} from '../../models/kitchen/order.model'
import {
  KitchenStationModel,
  type KitchenStation,
} from '../../models/kitchen/station.model'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoCreated,
  kitchenDemoTimestamp,
  kitchenDemoUpdated,
} from './fixtures'
import type { KitchenDemoIdentity } from './types'

type DemoOrderItemInput = {
  id: string
  itemId: string
  dishId: string
  itemKind: DishItemKind
  label: string
  unitPrice: number
  quantity?: number
  checked?: boolean
  variantId?: string
  variantLabel?: string
  addOns?: KitchenOrderItem['add_ons']
}

type DemoOrderInput = {
  identity: KitchenDemoIdentity
  serviceNumber: number
  status: KitchenOrderStatus
  orderType: KitchenOrderType
  channel: KitchenOrderChannel
  createdAt: string
  updatedAt?: string
  updatedBy?: string
  estimatedMinutes?: number
  estimatedAt?: string
  items: DemoOrderItemInput[]
  payment?: KitchenOrderPayment
  paymentMethod?: KitchenOrderPaymentMethod
  customerName?: string
  customerPhone?: string
  handoff?: 'tray' | 'bag'
  kitchenNote?: string
}

const paymentMethods = (orderType: KitchenOrderType) =>
  orderType === 'collection'
    ? ['online_card', 'card_at_pickup']
    : ['card_at_pickup']

const makeOrder = (input: DemoOrderInput): KitchenOrder => {
  const items: KitchenOrderItem[] = input.items.map((item) => ({
    id: item.id,
    source_item_id: item.itemId,
    menu_id: input.identity.menuId,
    dish_id: item.dishId,
    item_kind: item.itemKind,
    label: item.label,
    add_ons: item.addOns || [],
    variant_id: item.variantId,
    variant_label: item.variantLabel,
    unit_price: item.unitPrice,
    quantity: item.quantity ?? 1,
    checked: item.checked === true,
  }))
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unit_price || 0) * item.quantity,
    0
  )
  const reference = String(input.serviceNumber)
  const handoffInstructions = input.handoff === 'tray'
    ? 'Watch the screen for your tray number.'
    : input.handoff === 'bag'
      ? 'Collect your bag when your number is called.'
      : 'Collect from the counter.'

  return {
    ...KitchenOrderModel,
    id: `${input.identity.kitchenId}-demo-order-${reference}`,
    kitchen_id: input.identity.kitchenId,
    menu_id: input.identity.menuId,
    order_number: reference,
    service_id: input.identity.serviceId,
    service_number: input.serviceNumber,
    status: input.status,
    order_type: input.orderType,
    collection: input.orderType === 'collection' ? { mode: 'queue' } : {},
    estimated_ready_minutes: input.estimatedMinutes || 0,
    estimated_ready_at: input.estimatedAt
      ? kitchenDemoTimestamp(input.estimatedAt)
      : '',
    items,
    pricing: {
      minor_unit_digits: 2,
      subtotal: {
        amount_minor: Math.round(subtotal * 100),
        currency_code: 'CHF',
      },
      delivery_fee: {
        amount_minor: 0,
        currency_code: 'CHF',
      },
      total: {
        amount_minor: Math.round(subtotal * 100),
        currency_code: 'CHF',
      },
    },
    fulfilment_policy: {
      order_type: input.orderType,
      ...(input.orderType === 'collection'
        ? {
            asap_enabled: true,
            customer: {
              required_fields: ['name', 'phone'],
            },
          }
        : {}),
      handoff_instructions: handoffInstructions,
      payment_methods: paymentMethods(input.orderType),
    },
    fulfilment_match: input.orderType === 'eat_in' || input.orderType === 'takeaway'
      ? {
          type: 'counter',
          reference,
          handoff: input.handoff || (input.orderType === 'eat_in' ? 'tray' : 'bag'),
        }
      : {},
    customer: {
      ...(input.customerName ? { name: input.customerName } : {}),
      ...(input.customerPhone ? { phone: input.customerPhone } : {}),
    },
    kitchen_note: input.kitchenNote || '',
    payment: input.payment || {
      required: false,
      status: 'not_required',
      method: input.paymentMethod || 'card_at_pickup',
      currency_code: 'CHF',
    },
    channel: input.channel,
    created: kitchenDemoCreated(input.identity, input.createdAt, 'menu'),
    updated: kitchenDemoUpdated(
      input.updatedAt || input.createdAt,
      input.updatedBy || 'menu'
    ),
  }
}

export const deanosKitchenDemoOrders: KitchenOrder[] = [
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: 1,
    status: 'pending_payment',
    orderType: 'collection',
    channel: 'menu',
    createdAt: '2026-07-22T09:55:00.000Z',
    customerName: 'Noah',
    customerPhone: '+1 202-555-0101',
    items: [
      {
        id: 'item-1',
        itemId: 'deanos-classic-item',
        dishId: 'deanos-classic',
        itemKind: 'food',
        label: 'Deanos Classic',
        unitPrice: 21,
        addOns: [{ id: 'extra-cheddar', label: 'Extra cheddar', price: 2 }],
      },
    ],
    payment: {
      required: true,
      status: 'requires_payment',
      method: 'online_card',
      amount_chf: 21,
      currency_code: 'CHF',
    },
  }),
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: 2,
    status: 'pending_acceptance',
    orderType: 'collection',
    channel: 'menu',
    createdAt: '2026-07-22T09:58:00.000Z',
    customerName: 'Mina',
    customerPhone: '+1 202-555-0102',
    items: [
      {
        id: 'item-1',
        itemId: 'hot-honey-chicken-item',
        dishId: 'hot-honey-chicken',
        itemKind: 'food',
        label: 'Hot Honey Chicken',
        unitPrice: 20,
      },
      {
        id: 'item-2',
        itemId: 'skin-on-fries-item',
        dishId: 'skin-on-fries',
        itemKind: 'food',
        label: 'Skin-on fries',
        unitPrice: 6,
      },
    ],
  }),
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: 3,
    status: 'accepted',
    orderType: 'eat_in',
    channel: 'kiosk',
    createdAt: '2026-07-22T10:01:00.000Z',
    updatedAt: '2026-07-22T10:02:00.000Z',
    updatedBy: 'demo-operator',
    estimatedMinutes: 15,
    estimatedAt: '2026-07-22T10:17:00.000Z',
    customerName: 'Amina',
    handoff: 'tray',
    items: [
      {
        id: 'item-1',
        itemId: 'deanos-classic-item',
        dishId: 'deanos-classic',
        itemKind: 'food',
        label: 'Deanos Classic',
        unitPrice: 19,
      },
    ],
  }),
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: 4,
    status: 'ready',
    orderType: 'takeaway',
    channel: 'kiosk',
    createdAt: '2026-07-22T10:04:00.000Z',
    updatedAt: '2026-07-22T10:12:00.000Z',
    updatedBy: 'demo-operator',
    estimatedMinutes: 10,
    estimatedAt: '2026-07-22T10:15:00.000Z',
    customerName: 'Luca',
    handoff: 'bag',
    items: [
      {
        id: 'item-1',
        itemId: 'hot-honey-chicken-item',
        dishId: 'hot-honey-chicken',
        itemKind: 'food',
        label: 'Hot Honey Chicken',
        unitPrice: 20,
        checked: true,
      },
      {
        id: 'item-2',
        itemId: 'house-lemonade-item',
        dishId: 'house-lemonade',
        itemKind: 'drink',
        label: 'House lemonade',
        unitPrice: 5,
        checked: true,
      },
    ],
  }),
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: 5,
    status: 'cancelled',
    orderType: 'collection',
    channel: 'menu',
    createdAt: '2026-07-22T10:06:00.000Z',
    updatedAt: '2026-07-22T10:07:00.000Z',
    customerName: 'Sofia',
    customerPhone: '+1 202-555-0105',
    kitchenNote: 'Guest cancelled before acceptance.',
    items: [
      {
        id: 'item-1',
        itemId: 'skin-on-fries-item',
        dishId: 'skin-on-fries',
        itemKind: 'food',
        label: 'Skin-on fries',
        unitPrice: 6,
      },
    ],
  }),
]

const station = (
  id: string,
  name: string,
  description: string,
  sortOrder: number
): KitchenStation => ({
  ...KitchenStationModel,
  id,
  kitchen_id: deanosKitchenDemoIdentity.kitchenId,
  name,
  description,
  sort_order: sortOrder,
  created: kitchenDemoCreated(deanosKitchenDemoIdentity),
  updated: kitchenDemoUpdated(),
})

export const deanosKitchenDemoStations: KitchenStation[] = [
  station('grill', 'Grill', 'Burgers and hot holding.', 1),
  station('fryers', 'Fryers', 'Chicken and fries.', 2),
  station('pass', 'Pass', 'Final checks and guest handoff.', 3),
]

const miseTask = (
  id: string,
  title: string,
  stationId: string,
  status: KitchenMiseTask['status'],
  priority: KitchenMiseTask['priority'],
  estimatedMinutes: number,
  production: {
    ingredientIds?: string[]
    prepItemIds?: string[]
    recipeId?: string
  } = {}
): KitchenMiseTask => ({
  ...KitchenMiseTaskModel,
  id,
  kitchen_id: deanosKitchenDemoIdentity.kitchenId,
  title,
  station: stationId,
  service_date: '2026-07-22',
  status,
  priority,
  estimated_minutes: estimatedMinutes,
  ingredient_ids: [...(production.ingredientIds ?? [])],
  mise_ids: [...(production.prepItemIds ?? [])],
  menu_id: deanosKitchenDemoIdentity.menuId,
  recipe_id: production.recipeId ?? '',
  created: kitchenDemoCreated(
    deanosKitchenDemoIdentity,
    '2026-07-22T07:00:00.000Z'
  ),
  updated: kitchenDemoUpdated('2026-07-22T08:00:00.000Z'),
})

export const deanosKitchenDemoMiseTasks: KitchenMiseTask[] = [
  miseTask(
    'shape-burger-patties',
    'Shape burger patties',
    'grill',
    'done',
    'high',
    35,
    {
      ingredientIds: ['beef-mince'],
      prepItemIds: ['smash-patty-80g'],
    }
  ),
  miseTask(
    'mix-house-sauce',
    'Mix house sauce',
    'pass',
    'in_progress',
    'normal',
    20,
    { recipeId: 'deanos-burger-sauce' }
  ),
  miseTask('stock-takeaway-packaging', 'Stock takeaway packaging', 'pass', 'todo', 'normal', 10),
]

// Misebox Restaurant deliberately demonstrates the Menu/Kiosk presentation without
// implying that a service board, Stations or Mise workflow is already active.
export const miseboxRestaurantKitchenDemoOrders: KitchenOrder[] = []
export const miseboxRestaurantKitchenDemoStations: KitchenStation[] = []
export const miseboxRestaurantKitchenDemoMiseTasks: KitchenMiseTask[] = []

// Pizza the Action is likewise a Menu/Kiosk presentation world for now.
export const pizzaTheActionKitchenDemoOrders: KitchenOrder[] = []
export const pizzaTheActionKitchenDemoStations: KitchenStation[] = []
export const pizzaTheActionKitchenDemoMiseTasks: KitchenMiseTask[] = []
