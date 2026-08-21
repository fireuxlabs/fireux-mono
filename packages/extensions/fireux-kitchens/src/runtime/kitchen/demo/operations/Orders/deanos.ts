import type { KitchenOrder } from '../../../models/order.model.ts'
import { deanosKitchenDemoIdentity } from '../../core/fixtures'
import {
  DEANOS_KITCHEN_DEMO_AS_OF_DATE,
  deanosKitchenDemoCurrentService,
  deanosKitchenDemoOrderNumber,
} from './history'
import { makeOrder } from '../order-builders'

const deanosKitchenDemoNextServiceNumber =
  deanosKitchenDemoCurrentService.completedOrders.length + 1

const deanosCurrentOrderNumber = (serviceNumber: number) =>
  deanosKitchenDemoOrderNumber(DEANOS_KITCHEN_DEMO_AS_OF_DATE, serviceNumber)

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
  deanosKitchenDemoCurrentService.completedOrders.slice(-3).map((transaction) =>
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
