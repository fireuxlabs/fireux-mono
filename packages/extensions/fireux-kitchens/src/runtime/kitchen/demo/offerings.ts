import type { KitchenOrderTypeConfig } from '../models/ordering.model'
import type { KitchenOffering } from '../models/offering.model'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import { resolveKitchenOperationHours } from '../utils/kitchen-readers'
import {
  deanosKitchenDemoTarget,
  pizzaTheActionKitchenDemoTarget,
  miseboxRestaurantKitchenDemoTarget,
} from './core/targets'
import {
  deanosKitchenDemoIdentity,
  deanosPartyMenuDemoIdentity,
  deanosXmasMenuDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
  miseboxRestaurantKitchenDemoIdentity,
} from './core/fixtures'
const offerings = (
  menuIds: string[],
  policies: KitchenOrderTypeConfig[],
  hours: WeekdayTimeWindowsConfig
): KitchenOffering[] => [
  {
    id: 'offering-counter',
    name: 'Counter offering',
    enabled: true,
    menu_ids: menuIds,
    hours,
    interactions: [
      { type: 'browse', enabled: true },
      ...policies.map((policy) => ({ ...policy, enabled: true })),
    ],
  },
]
export const deanosOfferings = offerings(
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
  ],
  resolveKitchenOperationHours(
    deanosKitchenDemoTarget.configuration,
    deanosKitchenDemoTarget.place
  )
)
export const pizzaOfferings = offerings(
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
  ],
  resolveKitchenOperationHours(
    pizzaTheActionKitchenDemoTarget.configuration,
    pizzaTheActionKitchenDemoTarget.place
  )
)
export const miseboxOfferings = offerings(
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
  ],
  resolveKitchenOperationHours(
    miseboxRestaurantKitchenDemoTarget.configuration,
    miseboxRestaurantKitchenDemoTarget.place
  )
)
