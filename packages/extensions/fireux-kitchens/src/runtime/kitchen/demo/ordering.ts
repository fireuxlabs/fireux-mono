import type {
  KitchenOrderingConfig,
  KitchenOrderTypeConfig,
} from '../models/ordering.model'
import {
  deanosKitchenDemoIdentity,
  deanosPartyMenuDemoIdentity,
  deanosXmasMenuDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
  miseboxRestaurantKitchenDemoIdentity,
} from './core/fixtures'
const ordering = (
  menuIds: string[],
  policies: KitchenOrderTypeConfig[]
): KitchenOrderingConfig => ({
  services: policies.map((policy) => ({
    ...policy,
    enabled: true,
    menu_ids: menuIds,
  })),
})
export const deanosOrdering = ordering(
  [
    deanosKitchenDemoIdentity.menuId,
    deanosPartyMenuDemoIdentity.menuId,
    deanosXmasMenuDemoIdentity.menuId,
  ],
  [
    {
      type: 'eat_in',
      fulfilment: {
        handoff_instructions: 'Watch the screen for your tray number.',
      },
    },
    {
      type: 'takeaway',
      fulfilment: {
        handoff_instructions: 'Collect your bag when your number is called.',
      },
    },
    {
      type: 'collection',
      asap_enabled: true,
      fulfilment: {
        handoff_instructions: 'Collect from the counter.',
      },
      customer: {
        required_fields: ['name', 'phone'],
      },
    },
  ]
)
export const pizzaOrdering = ordering(
  [pizzaTheActionKitchenDemoIdentity.menuId],
  [
    {
      type: 'eat_in',
      fulfilment: {
        handoff_instructions: 'Watch the screen for your table order number.',
      },
    },
    {
      type: 'takeaway',
      fulfilment: {
        handoff_instructions: 'Collect your pizza when your number is called.',
      },
    },
    {
      type: 'collection',
      asap_enabled: true,
      fulfilment: {
        handoff_instructions: 'Collect from the pizza counter.',
      },
      customer: {
        required_fields: ['name', 'phone'],
      },
    },
  ]
)
export const miseboxOrdering = ordering(
  [miseboxRestaurantKitchenDemoIdentity.menuId],
  [
    {
      type: 'eat_in',
      fulfilment: {
        handoff_instructions: 'Watch the screen for your tray number.',
      },
    },
    {
      type: 'takeaway',
      fulfilment: {
        handoff_instructions: 'Collect your bag when your number is called.',
      },
    },
  ]
)
