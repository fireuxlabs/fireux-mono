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
  deanosPartyMenuDemoIdentity,
  deanosXmasMenuDemoIdentity,
  kitchenDemoCreated,
  kitchenDemoTimestamp,
  kitchenDemoUpdated,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from './core/fixtures'
import type { KitchenDemoIdentity } from './core/types'
import {
  DEANOS_KITCHEN_DEMO_AS_OF_DATE,
  deanosKitchenDemoOrderNumber,
  deanosKitchenDemoCurrentService,
} from './operations/Orders/history'

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
  id?: string
  orderNumber?: string
  serviceId?: string
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
  totalMinor?: number
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
  const reference = input.orderNumber ?? String(input.serviceNumber)
  const handoffInstructions = input.handoff === 'tray'
    ? 'Watch the screen for your tray number.'
    : input.handoff === 'bag'
      ? 'Collect your bag when your number is called.'
      : 'Collect from the counter.'

  return {
    ...KitchenOrderModel,
    id: input.id ?? `${input.identity.kitchenId}-demo-order-${reference}`,
    kitchen_id: input.identity.kitchenId,
    menu_id: input.identity.menuId,
    order_number: reference,
    service_id: input.serviceId ?? input.identity.serviceId,
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
        amount_minor: input.totalMinor ?? Math.round(subtotal * 100),
        currency_code: 'CHF',
      },
      delivery_fee: {
        amount_minor: 0,
        currency_code: 'CHF',
      },
      total: {
        amount_minor: input.totalMinor ?? Math.round(subtotal * 100),
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

const deanosKitchenDemoNextServiceNumber =
  deanosKitchenDemoCurrentService.completedOrders.length + 1
const deanosCurrentOrderNumber = (serviceNumber: number) =>
  deanosKitchenDemoOrderNumber(
    DEANOS_KITCHEN_DEMO_AS_OF_DATE,
    serviceNumber
  )

const deanosKitchenDemoActiveOrders: KitchenOrder[] = [
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: deanosKitchenDemoNextServiceNumber,
    orderNumber: deanosCurrentOrderNumber(deanosKitchenDemoNextServiceNumber),
    status: 'pending_payment',
    orderType: 'collection',
    channel: 'menu',
    createdAt: '2026-07-26T18:55:00.000Z',
    customerName: 'Noah',
    customerPhone: '+41 79 555 01 01',
    items: [
      {
        id: 'item-1',
        itemId: 'deanos-classic-item',
        dishId: 'deanos-classic',
        itemKind: 'food',
        label: 'Deanos Classic',
        unitPrice: 18,
        variantId: 'single',
        variantLabel: 'Single',
        addOns: [{ id: 'extra-cheddar', label: 'Extra cheddar', price: 2 }],
      },
    ],
    payment: {
      required: true,
      status: 'requires_payment',
      method: 'online_card',
      amount_chf: 18,
      currency_code: 'CHF',
    },
  }),
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: deanosKitchenDemoNextServiceNumber + 1,
    orderNumber: deanosCurrentOrderNumber(
      deanosKitchenDemoNextServiceNumber + 1
    ),
    status: 'pending_acceptance',
    orderType: 'collection',
    channel: 'menu',
    createdAt: '2026-07-26T18:58:00.000Z',
    customerName: 'Mina',
    customerPhone: '+41 79 555 01 02',
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
    serviceNumber: deanosKitchenDemoNextServiceNumber + 2,
    orderNumber: deanosCurrentOrderNumber(
      deanosKitchenDemoNextServiceNumber + 2
    ),
    status: 'accepted',
    orderType: 'eat_in',
    channel: 'kiosk',
    createdAt: '2026-07-26T19:01:00.000Z',
    updatedAt: '2026-07-26T19:02:00.000Z',
    updatedBy: 'deanos-alex',
    estimatedMinutes: 15,
    estimatedAt: '2026-07-26T19:17:00.000Z',
    customerName: 'Amina',
    handoff: 'tray',
    items: [
      {
        id: 'item-1',
        itemId: 'deanos-classic-item',
        dishId: 'deanos-classic',
        itemKind: 'food',
        label: 'Deanos Classic',
        unitPrice: 16,
        variantId: 'single',
        variantLabel: 'Single',
      },
    ],
  }),
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: deanosKitchenDemoNextServiceNumber + 3,
    orderNumber: deanosCurrentOrderNumber(
      deanosKitchenDemoNextServiceNumber + 3
    ),
    status: 'ready',
    orderType: 'takeaway',
    channel: 'kiosk',
    createdAt: '2026-07-26T19:04:00.000Z',
    updatedAt: '2026-07-26T19:12:00.000Z',
    updatedBy: 'deanos-sam',
    estimatedMinutes: 10,
    estimatedAt: '2026-07-26T19:15:00.000Z',
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
    serviceNumber: deanosKitchenDemoNextServiceNumber + 4,
    orderNumber: deanosCurrentOrderNumber(
      deanosKitchenDemoNextServiceNumber + 4
    ),
    status: 'cancelled',
    orderType: 'collection',
    channel: 'menu',
    createdAt: '2026-07-26T19:06:00.000Z',
    updatedAt: '2026-07-26T19:07:00.000Z',
    customerName: 'Sofia',
    customerPhone: '+41 79 555 01 05',
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
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: deanosKitchenDemoNextServiceNumber + 5,
    orderNumber: deanosCurrentOrderNumber(
      deanosKitchenDemoNextServiceNumber + 5
    ),
    status: 'pending_acceptance',
    orderType: 'collection',
    channel: 'menu',
    createdAt: '2026-07-26T19:08:00.000Z',
    customerName: 'Lea',
    customerPhone: '+41 79 555 01 06',
    items: [
      {
        id: 'item-1',
        itemId: 'swiss-melt-item',
        dishId: 'swiss-melt',
        itemKind: 'food',
        label: 'Swiss Melt',
        unitPrice: 22,
      },
      {
        id: 'item-2',
        itemId: 'onion-rings-item',
        dishId: 'onion-rings',
        itemKind: 'food',
        label: 'Crispy onion rings',
        unitPrice: 7,
      },
    ],
  }),
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: deanosKitchenDemoNextServiceNumber + 6,
    orderNumber: deanosCurrentOrderNumber(
      deanosKitchenDemoNextServiceNumber + 6
    ),
    status: 'accepted',
    orderType: 'takeaway',
    channel: 'kiosk',
    createdAt: '2026-07-26T19:09:00.000Z',
    updatedAt: '2026-07-26T19:10:00.000Z',
    updatedBy: 'deanos-jo',
    estimatedMinutes: 12,
    estimatedAt: '2026-07-26T19:22:00.000Z',
    customerName: 'Mateo',
    handoff: 'bag',
    items: [
      {
        id: 'item-1',
        itemId: 'double-trouble-item',
        dishId: 'double-trouble',
        itemKind: 'food',
        label: 'Double Trouble',
        unitPrice: 27,
        addOns: [{ id: 'smoked-bacon', label: 'Smoked bacon', price: 3 }],
      },
      {
        id: 'item-2',
        itemId: 'dirty-deanos-fries-item',
        dishId: 'dirty-deanos-fries',
        itemKind: 'food',
        label: 'Dirty Deanos fries',
        unitPrice: 13,
      },
    ],
  }),
  makeOrder({
    identity: deanosKitchenDemoIdentity,
    serviceNumber: deanosKitchenDemoNextServiceNumber + 7,
    orderNumber: deanosCurrentOrderNumber(
      deanosKitchenDemoNextServiceNumber + 7
    ),
    status: 'ready',
    orderType: 'eat_in',
    channel: 'kiosk',
    createdAt: '2026-07-26T19:10:00.000Z',
    updatedAt: '2026-07-26T19:18:00.000Z',
    updatedBy: 'deanos-alex',
    estimatedMinutes: 10,
    estimatedAt: '2026-07-26T19:20:00.000Z',
    customerName: 'Nora',
    handoff: 'tray',
    items: [
      {
        id: 'item-1',
        itemId: 'crispy-cauliflower-item',
        dishId: 'crispy-cauliflower',
        itemKind: 'food',
        label: 'Crispy Cauliflower',
        unitPrice: 18,
        checked: true,
      },
      {
        id: 'item-2',
        itemId: 'cherry-vanilla-shake-item',
        dishId: 'cherry-vanilla-shake',
        itemKind: 'drink',
        label: 'Cherry vanilla shake',
        unitPrice: 8,
        checked: true,
      },
    ],
  }),
]

const deanosKitchenDemoRecentCompletedOrders: KitchenOrder[] =
  deanosKitchenDemoCurrentService.completedOrders
    .slice(-3)
    .map(transaction =>
      makeOrder({
        identity: deanosKitchenDemoIdentity,
        id: transaction.id,
        orderNumber: transaction.orderNumber,
        serviceId: transaction.serviceId,
        serviceNumber: transaction.serviceNumber,
        status: 'completed',
        orderType: transaction.orderType,
        channel: transaction.channel,
        createdAt: transaction.placedAt,
        updatedAt: transaction.completedAt,
        updatedBy: transaction.closedByTeamMemberId,
        totalMinor: transaction.pricing.totalMinor,
        items: transaction.items.map((item, itemIndex) => ({
          id: `item-${itemIndex + 1}`,
          itemId: item.sourceItemId,
          dishId: item.dishId,
          itemKind: item.itemKind,
          label: item.label,
          unitPrice: item.unitPriceMinor / 100,
          quantity: item.quantity,
          checked: true,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          ...(item.variantLabel ? { variantLabel: item.variantLabel } : {}),
        })),
      })
    )

export const deanosKitchenDemoOrders: KitchenOrder[] = [
  ...deanosKitchenDemoActiveOrders,
  ...deanosKitchenDemoRecentCompletedOrders,
]

const station = (
  identity: KitchenDemoIdentity,
  id: string,
  name: string,
  description: string,
  sortOrder: number
): KitchenStation => ({
  ...KitchenStationModel,
  id,
  kitchen_id: identity.kitchenId,
  name,
  description,
  sort_order: sortOrder,
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

export const deanosKitchenDemoStations: KitchenStation[] = [
  station(deanosKitchenDemoIdentity, 'prep', 'Prep', 'Cold prep, sauces and batch work.', 1),
  station(deanosKitchenDemoIdentity, 'grill', 'Grill', 'Burgers and hot holding.', 2),
  station(deanosKitchenDemoIdentity, 'fryers', 'Fryers', 'Chicken and fries.', 3),
  station(deanosKitchenDemoIdentity, 'drinks', 'Drinks', 'Shakes, coolers and garnish.', 4),
  station(deanosKitchenDemoIdentity, 'pass', 'Pass', 'Final checks and guest handoff.', 5),
]

type DemoMiseChecklistInput =
  | string
  | {
      done?: boolean
      label: string
    }

const miseTask = (
  identity: KitchenDemoIdentity,
  id: string,
  title: string,
  stationId: string,
  status: KitchenMiseTask['status'],
  priority: KitchenMiseTask['priority'],
  estimatedMinutes: number,
  production: {
    checklist?: DemoMiseChecklistInput[]
    description?: string
    ingredientIds?: string[]
    prepItemIds?: string[]
    recipeId?: string
    workflowStage?: KitchenMiseTask['workflow_stage']
  } = {}
): KitchenMiseTask => {
  const serviceDate =
    identity.kitchenId === deanosKitchenDemoIdentity.kitchenId
      ? DEANOS_KITCHEN_DEMO_AS_OF_DATE
      : '2026-07-22'
  const resolvedStatus =
    identity.menuId === deanosKitchenDemoIdentity.menuId
      ? 'done'
      : status

  return {
  ...KitchenMiseTaskModel,
  id,
  kitchen_id: identity.kitchenId,
  title,
  description: production.description ?? '',
  station: stationId,
  workflow_stage: production.workflowStage ?? '',
  service_date: serviceDate,
  status: resolvedStatus,
  priority,
  estimated_minutes: estimatedMinutes,
  ingredient_ids: [...(production.ingredientIds ?? [])],
  mise_ids: [...(production.prepItemIds ?? [])],
  menu_id: identity.menuId,
  recipe_id: production.recipeId ?? '',
  checklist: (production.checklist ?? []).map((item, index) => ({
    id: `${id}-step-${index + 1}`,
    label: typeof item === 'string' ? item : item.label,
    done:
      resolvedStatus === 'done'
      || (typeof item !== 'string' && item.done === true),
  })),
  created: kitchenDemoCreated(
    identity,
    `${serviceDate}T07:00:00.000Z`
  ),
  updated: kitchenDemoUpdated(`${serviceDate}T08:00:00.000Z`),
  }
}

type DemoRecipeMiseTaskInput = {
  identity: KitchenDemoIdentity
  minutes: number
  priority?: KitchenMiseTask['priority']
  recipeId: string
  stage: KitchenMiseTask['workflow_stage']
  station: string
  status?: KitchenMiseTask['status']
  title: string
}

const recipeMiseTask = (
  input: DemoRecipeMiseTaskInput
): KitchenMiseTask => {
  const status = input.status ?? 'todo'
  const completedSteps = status === 'done'
    ? 3
    : status === 'in_progress'
      ? 1
      : 0

  return miseTask(
    input.identity,
    `batch-${input.recipeId}`,
    input.title,
    input.station,
    status,
    input.priority ?? 'normal',
    input.minutes,
    {
      recipeId: input.recipeId,
      workflowStage: input.stage,
      description: 'Prepare one labelled service batch from the linked recipe.',
      checklist: [
        { label: 'Weigh and check ingredients', done: completedSteps >= 1 },
        { label: 'Follow the batch method', done: completedSteps >= 2 },
        { label: 'Label, date and store', done: completedSteps >= 3 },
      ],
    }
  )
}

const deanosKitchenDemoRecipeTaskDefinitions: DemoRecipeMiseTaskInput[] = [
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'deanos-burger-sauce',
    title: 'Make Deanos burger sauce',
    stage: 'make',
    station: 'prep',
    status: 'in_progress',
    priority: 'high',
    minutes: 20,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'smoky-burger-sauce',
    title: 'Make smoky burger sauce',
    stage: 'make',
    station: 'prep',
    minutes: 15,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'peppercorn-mayo',
    title: 'Make peppercorn mayo',
    stage: 'make',
    station: 'prep',
    minutes: 12,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'ranch-dressing',
    title: 'Make herbed ranch',
    stage: 'make',
    station: 'prep',
    minutes: 18,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'chilli-mayo',
    title: 'Make chilli mayo',
    stage: 'make',
    station: 'prep',
    minutes: 10,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'smoky-vegan-mayo',
    title: 'Make smoky vegan mayo',
    stage: 'make',
    station: 'prep',
    minutes: 10,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'deanos-crispy-batter',
    title: 'Mix crispy batter',
    stage: 'make',
    station: 'fryers',
    priority: 'high',
    minutes: 15,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'buttermilk-chicken',
    title: 'Marinate buttermilk chicken',
    stage: 'make',
    station: 'prep',
    status: 'done',
    priority: 'high',
    minutes: 25,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'red-cabbage-slaw',
    title: 'Make red cabbage slaw',
    stage: 'make',
    station: 'prep',
    status: 'done',
    minutes: 20,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'hot-honey-glaze',
    title: 'Make hot-honey glaze',
    stage: 'cook_chill',
    station: 'prep',
    minutes: 15,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'caramelised-onions',
    title: 'Cook caramelised onions',
    stage: 'cook_chill',
    station: 'grill',
    status: 'in_progress',
    priority: 'high',
    minutes: 45,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'dirty-fries-cheese-sauce',
    title: 'Cook dirty-fries cheese sauce',
    stage: 'cook_chill',
    station: 'prep',
    minutes: 25,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'salted-caramel-sauce',
    title: 'Cook salted-caramel sauce',
    stage: 'cook_chill',
    station: 'drinks',
    status: 'done',
    minutes: 25,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'cherry-vanilla-syrup',
    title: 'Cook cherry-vanilla syrup',
    stage: 'cook_chill',
    station: 'drinks',
    minutes: 20,
  },
  {
    identity: deanosKitchenDemoIdentity,
    recipeId: 'house-lemonade-cordial',
    title: 'Make lemonade cordial',
    stage: 'cook_chill',
    station: 'drinks',
    minutes: 20,
  },
  {
    identity: deanosPartyMenuDemoIdentity,
    recipeId: 'strawberry-lime-cooler-base',
    title: 'Make party strawberry & lime cooler',
    stage: 'cook_chill',
    station: 'drinks',
    minutes: 25,
  },
  {
    identity: deanosPartyMenuDemoIdentity,
    recipeId: 'cucumber-mint-cooler-base',
    title: 'Make party cucumber & mint cooler',
    stage: 'make',
    station: 'drinks',
    minutes: 20,
  },
  {
    identity: deanosXmasMenuDemoIdentity,
    recipeId: 'pigs-in-blankets',
    title: 'Make pigs in blankets',
    stage: 'make',
    station: 'prep',
    priority: 'high',
    minutes: 30,
  },
  {
    identity: deanosXmasMenuDemoIdentity,
    recipeId: 'fried-camembert',
    title: 'Crumb Camembert portions',
    stage: 'make',
    station: 'fryers',
    minutes: 25,
  },
  {
    identity: deanosXmasMenuDemoIdentity,
    recipeId: 'mustard-mayo',
    title: 'Make mustard mayo',
    stage: 'make',
    station: 'prep',
    minutes: 10,
  },
  {
    identity: deanosXmasMenuDemoIdentity,
    recipeId: 'sage-onion-stuffing',
    title: 'Cook sage & onion stuffing',
    stage: 'cook_chill',
    station: 'prep',
    minutes: 35,
  },
  {
    identity: deanosXmasMenuDemoIdentity,
    recipeId: 'gravy-mayo',
    title: 'Make gravy mayo',
    stage: 'make',
    station: 'prep',
    minutes: 12,
  },
  {
    identity: deanosXmasMenuDemoIdentity,
    recipeId: 'fried-brie-bites',
    title: 'Crumb Brie bites',
    stage: 'make',
    station: 'fryers',
    minutes: 25,
  },
  {
    identity: deanosXmasMenuDemoIdentity,
    recipeId: 'cranberry-chilli-dip',
    title: 'Make cranberry chilli dip',
    stage: 'make',
    station: 'prep',
    minutes: 10,
  },
]
const deanosKitchenDemoRecipeTasks =
  deanosKitchenDemoRecipeTaskDefinitions.map(recipeMiseTask)

export const deanosKitchenDemoMiseTasks: KitchenMiseTask[] = [
  miseTask(
    deanosKitchenDemoIdentity,
    'wash-main-service-produce',
    'Wash and clean service produce',
    'prep',
    'in_progress',
    'high',
    30,
    {
      workflowStage: 'wash',
      ingredientIds: [
        'lettuce',
        'tomato',
        'spring-onion',
        'mint',
        'lemon',
        'brown-mushrooms',
      ],
      prepItemIds: [
        'washed-shredded-lettuce',
        'sliced-tomato',
        'sliced-spring-onion',
        'washed-mint',
        'lemon-garnish',
        'sliced-brown-mushrooms',
      ],
      checklist: [
        { label: 'Wash and spin lettuce', done: true },
        { label: 'Wash tomatoes and spring onions', done: true },
        'Wash mint and lemons',
        'Clean mushrooms without soaking',
      ],
    }
  ),
  miseTask(
    deanosPartyMenuDemoIdentity,
    'wash-party-produce',
    'Wash party produce',
    'prep',
    'todo',
    'normal',
    15,
    {
      workflowStage: 'wash',
      ingredientIds: ['basil', 'cucumber'],
      prepItemIds: ['washed-basil', 'sliced-cucumber'],
      checklist: ['Wash and dry basil', 'Wash cucumbers'],
    }
  ),
  miseTask(
    deanosXmasMenuDemoIdentity,
    'wash-xmas-rocket',
    'Wash Xmas rocket',
    'prep',
    'todo',
    'normal',
    10,
    {
      workflowStage: 'wash',
      ingredientIds: ['rocket'],
      prepItemIds: ['washed-rocket'],
      checklist: ['Wash rocket', 'Spin dry and hold chilled'],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'shape-main-patties',
    'Portion burger balls',
    'grill',
    'done',
    'high',
    35,
    {
      workflowStage: 'cut_portion',
      ingredientIds: ['beef-mince'],
      prepItemIds: ['smash-patty-80g'],
      checklist: [
        { label: 'Weigh 80 g portions', done: true },
        { label: 'Roll into loose balls', done: true },
        { label: 'Tray, cover and chill', done: true },
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'split-main-buns',
    'Split burger buns',
    'prep',
    'todo',
    'normal',
    15,
    {
      workflowStage: 'cut_portion',
      prepItemIds: ['split-burger-bun'],
      checklist: ['Split buns cleanly', 'Tray for service'],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'slice-main-cheese',
    'Slice and portion cheese',
    'prep',
    'todo',
    'normal',
    20,
    {
      workflowStage: 'cut_portion',
      ingredientIds: ['swiss-cheese', 'cheddar-cheese'],
      prepItemIds: ['sliced-swiss-cheese', 'sliced-cheddar'],
      checklist: ['Slice Swiss cheese', 'Slice cheddar', 'Cover and chill'],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'cut-main-produce',
    'Cut service produce',
    'prep',
    'todo',
    'high',
    30,
    {
      workflowStage: 'cut_portion',
      prepItemIds: [
        'washed-shredded-lettuce',
        'sliced-brown-mushrooms',
        'sliced-tomato',
        'sliced-spring-onion',
      ],
      checklist: [
        'Shred lettuce',
        'Slice mushrooms',
        'Slice tomatoes',
        'Slice spring onions',
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'portion-fryer-veg',
    'Cut and portion fryer vegetables',
    'fryers',
    'todo',
    'normal',
    25,
    {
      workflowStage: 'cut_portion',
      prepItemIds: ['cauliflower-florets', 'sliced-onion-rings'],
      checklist: [
        'Cut even cauliflower florets',
        'Slice and separate onion rings',
        'Dry and portion',
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'portion-drinks-garnish',
    'Portion drinks garnish',
    'drinks',
    'todo',
    'normal',
    15,
    {
      workflowStage: 'cut_portion',
      prepItemIds: [
        'washed-mint',
        'lemon-garnish',
        'service-ready-vanilla-soft-serve',
      ],
      checklist: [
        'Pick mint sprigs',
        'Slice lemon garnish',
        'Check soft-serve level',
      ],
    }
  ),
  miseTask(
    deanosPartyMenuDemoIdentity,
    'portion-party-burgers',
    'Portion party sliders',
    'prep',
    'todo',
    'high',
    35,
    {
      workflowStage: 'cut_portion',
      prepItemIds: ['slider-patty-60g', 'split-slider-bun'],
      checklist: [
        'Shape 60 g slider patties',
        'Split slider buns',
        'Count against party order',
      ],
    }
  ),
  miseTask(
    deanosXmasMenuDemoIdentity,
    'portion-xmas-cheese',
    'Slice Xmas Brie',
    'prep',
    'todo',
    'normal',
    15,
    {
      workflowStage: 'cut_portion',
      prepItemIds: ['sliced-brie'],
      checklist: ['Slice Brie evenly', 'Cover and chill'],
    }
  ),
  ...deanosKitchenDemoRecipeTasks,
  miseTask(
    deanosKitchenDemoIdentity,
    'cook-smoked-bacon',
    'Cook and portion smoked bacon',
    'grill',
    'todo',
    'high',
    25,
    {
      workflowStage: 'cook_chill',
      prepItemIds: ['cooked-smoked-bacon'],
      checklist: [
        'Cook bacon until crisp',
        'Drain and cool safely',
        'Portion for service',
      ],
    }
  ),
  miseTask(
    deanosXmasMenuDemoIdentity,
    'roast-xmas-turkey',
    'Roast, chill and portion turkey',
    'grill',
    'todo',
    'high',
    90,
    {
      workflowStage: 'cook_chill',
      prepItemIds: ['roast-turkey'],
      checklist: [
        'Roast turkey to safe core temperature',
        'Record temperature',
        'Chill, slice and label',
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'set-grill-station',
    'Set the grill station',
    'grill',
    'todo',
    'high',
    15,
    {
      workflowStage: 'set_stations',
      checklist: [
        'Load patties, cheese and buns',
        'Set onions, mushrooms and bacon',
        'Check scraper, seasoning and cloths',
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'set-fryer-station',
    'Set the fryer station',
    'fryers',
    'todo',
    'high',
    15,
    {
      workflowStage: 'set_stations',
      checklist: [
        'Load chicken, cauliflower and sides',
        'Set batter and draining trays',
        'Check oil temperature',
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'set-drinks-station',
    'Set the drinks station',
    'drinks',
    'todo',
    'normal',
    12,
    {
      workflowStage: 'set_stations',
      checklist: [
        'Load syrups and cordial',
        'Set cups, lids and straws',
        'Check soft serve and sparkling water',
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'set-pass',
    'Set the pass and packaging',
    'pass',
    'todo',
    'normal',
    12,
    {
      workflowStage: 'set_stations',
      checklist: [
        'Stock trays, bags and napkins',
        'Set sauces and garnishes',
        'Check printer and order screen',
      ],
    }
  ),
  miseTask(
    deanosPartyMenuDemoIdentity,
    'set-party-packing',
    'Set the party packing area',
    'pass',
    'todo',
    'normal',
    15,
    {
      workflowStage: 'set_stations',
      checklist: [
        'Count platters and drink vessels',
        'Label collection order',
        'Set holding and handoff space',
      ],
    }
  ),
  miseTask(
    deanosXmasMenuDemoIdentity,
    'set-xmas-pass',
    'Set the Xmas pass',
    'pass',
    'todo',
    'normal',
    15,
    {
      workflowStage: 'set_stations',
      checklist: [
        'Set cranberry and gravy garnishes',
        'Check festive packaging',
        'Brief pass on Xmas builds',
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'final-allergen-check',
    'Complete allergen and label check',
    'pass',
    'todo',
    'urgent',
    12,
    {
      workflowStage: 'final_checks',
      checklist: [
        'Check every batch label and date',
        'Confirm allergen utensils and containers',
        'Brief the service team',
      ],
    }
  ),
  miseTask(
    deanosKitchenDemoIdentity,
    'final-par-temperature-check',
    'Check par, temperatures and readiness',
    'pass',
    'todo',
    'high',
    10,
    {
      workflowStage: 'final_checks',
      checklist: [
        'Check chilled and hot-hold temperatures',
        'Confirm opening pars',
        'Sign off every station',
      ],
    }
  ),
]

export const miseboxRestaurantKitchenDemoOrders: KitchenOrder[] = [
  makeOrder({
    identity: miseboxRestaurantKitchenDemoIdentity,
    serviceNumber: 21,
    status: 'accepted',
    orderType: 'eat_in',
    channel: 'kiosk',
    createdAt: '2026-07-22T11:41:00.000Z',
    updatedAt: '2026-07-22T11:43:00.000Z',
    updatedBy: 'demo-operator',
    estimatedMinutes: 18,
    estimatedAt: '2026-07-22T12:01:00.000Z',
    customerName: 'Mara',
    handoff: 'tray',
    items: [
      {
        id: 'item-1',
        itemId: 'ember-roasted-chicken-item',
        dishId: 'ember-roasted-chicken',
        itemKind: 'food',
        label: 'Ember-roasted chicken',
        unitPrice: 29,
      },
    ],
  }),
  makeOrder({
    identity: miseboxRestaurantKitchenDemoIdentity,
    serviceNumber: 22,
    status: 'ready',
    orderType: 'takeaway',
    channel: 'kiosk',
    createdAt: '2026-07-22T11:44:00.000Z',
    updatedAt: '2026-07-22T11:55:00.000Z',
    updatedBy: 'demo-operator',
    estimatedMinutes: 12,
    estimatedAt: '2026-07-22T11:56:00.000Z',
    customerName: 'Jonas',
    handoff: 'bag',
    items: [
      {
        id: 'item-1',
        itemId: 'green-tahini-falafel-bowl-item',
        dishId: 'green-tahini-falafel-bowl',
        itemKind: 'food',
        label: 'Green tahini falafel bowl',
        unitPrice: 23,
        checked: true,
      },
      {
        id: 'item-2',
        itemId: 'cucumber-mint-cooler-item',
        dishId: 'cucumber-mint-cooler',
        itemKind: 'drink',
        label: 'Cucumber & mint cooler',
        unitPrice: 7,
        checked: true,
      },
    ],
  }),
]

export const miseboxRestaurantKitchenDemoStations: KitchenStation[] = [
  station(
    miseboxRestaurantKitchenDemoIdentity,
    'hearth',
    'Hearth',
    'Wood-fired breads, vegetables and roasting.',
    1
  ),
  station(
    miseboxRestaurantKitchenDemoIdentity,
    'garden-pass',
    'Garden pass',
    'Cold assembly, drinks and final checks.',
    2
  ),
]

export const miseboxRestaurantKitchenDemoMiseTasks: KitchenMiseTask[] = [
  miseTask(
    miseboxRestaurantKitchenDemoIdentity,
    'prep-hearth-chicken',
    'Brine hearth chicken',
    'hearth',
    'in_progress',
    'high',
    30,
    { ingredientIds: ['chicken-breast', 'lemon'] }
  ),
  miseTask(
    miseboxRestaurantKitchenDemoIdentity,
    'press-cucumber-cooler',
    'Press cucumber and mint cooler base',
    'garden-pass',
    'todo',
    'normal',
    20,
    { ingredientIds: ['cucumber', 'mint', 'lime'] }
  ),
]

export const pizzaTheActionKitchenDemoOrders: KitchenOrder[] = [
  makeOrder({
    identity: pizzaTheActionKitchenDemoIdentity,
    serviceNumber: 31,
    status: 'pending_acceptance',
    orderType: 'collection',
    channel: 'menu',
    createdAt: '2026-07-22T17:36:00.000Z',
    customerName: 'Elena',
    customerPhone: '+41 79 555 01 31',
    items: [
      {
        id: 'item-1',
        itemId: 'action-margherita-item',
        dishId: 'action-margherita',
        itemKind: 'food',
        label: 'Action Margherita',
        unitPrice: 18,
        variantId: '28-cm',
        variantLabel: '28 cm',
      },
    ],
  }),
  makeOrder({
    identity: pizzaTheActionKitchenDemoIdentity,
    serviceNumber: 32,
    status: 'ready',
    orderType: 'takeaway',
    channel: 'kiosk',
    createdAt: '2026-07-22T17:38:00.000Z',
    updatedAt: '2026-07-22T17:50:00.000Z',
    updatedBy: 'demo-operator',
    estimatedMinutes: 12,
    estimatedAt: '2026-07-22T17:50:00.000Z',
    customerName: 'Nico',
    handoff: 'bag',
    items: [
      {
        id: 'item-1',
        itemId: 'pepperoni-punch-item',
        dishId: 'pepperoni-punch',
        itemKind: 'food',
        label: 'Pepperoni Punch',
        unitPrice: 23,
        checked: true,
      },
      {
        id: 'item-2',
        itemId: 'garlic-knots-item',
        dishId: 'garlic-knots',
        itemKind: 'food',
        label: 'Garlic knots',
        unitPrice: 8,
        checked: true,
      },
    ],
  }),
]

export const pizzaTheActionKitchenDemoStations: KitchenStation[] = [
  station(
    pizzaTheActionKitchenDemoIdentity,
    'pizza-oven',
    'Pizza oven',
    'Stretching, topping and wood-fired baking.',
    1
  ),
  station(
    pizzaTheActionKitchenDemoIdentity,
    'pizza-pass',
    'Pizza pass',
    'Sides, slicing and guest handoff.',
    2
  ),
]

export const pizzaTheActionKitchenDemoMiseTasks: KitchenMiseTask[] = [
  miseTask(
    pizzaTheActionKitchenDemoIdentity,
    'mix-pizza-dough',
    'Mix and portion pizza dough',
    'pizza-oven',
    'done',
    'high',
    45,
    { ingredientIds: ['flour', 'sea-salt'] }
  ),
  miseTask(
    pizzaTheActionKitchenDemoIdentity,
    'prep-pizza-garnishes',
    'Prep tomato, basil and rocket',
    'pizza-pass',
    'in_progress',
    'normal',
    25,
    { ingredientIds: ['tomato', 'basil', 'rocket'] }
  ),
]
