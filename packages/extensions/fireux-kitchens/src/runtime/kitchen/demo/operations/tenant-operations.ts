import type { KitchenMiseTask } from '../../models/mise.model.ts'
import type { KitchenOrder } from '../../models/order.model.ts'
import {
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from '../core/fixtures'
import { makeOrder } from './order-builders'
import { miseTask } from './mise/builders'

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

